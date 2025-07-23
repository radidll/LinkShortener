from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, HttpUrl
from typing import List
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import string, random, jwt, datetime # type: ignore

from LinkShortener.database import SessionLocal, engine, Base
from LinkShortener.models import User, URL

# DB tablolarını oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS ayarları (geliştirme için *)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT ayarları
SECRET_KEY = "your_secret_key"  # Güçlü bir secret koy
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Şifreleme
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 password bearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# DB session yönetimi
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Kullanıcı modelleri
class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str

    class Config:
        orm_mode = True

# Link modelleri
class URLRequest(BaseModel):
    original_url: HttpUrl

class URLResponse(BaseModel):
    short_url: str
    original_url: HttpUrl
    click_count: int

    class Config:
        orm_mode = True

# Helper fonksiyonlar
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: datetime.timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token geçersiz veya süresi dolmuş",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = get_user(db, username)
    if user is None:
        raise credentials_exception
    return user

# Kısa kod üretici
def generate_short_code(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choices(chars, k=length))

# ROUTES

# Kullanıcı kayıt
@app.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Kullanıcı zaten mevcut")
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Token alma (login)
@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Kullanıcı adı veya şifre hatalı")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Link kısaltma (token ile korumalı)
@app.post("/shorten", response_model=URLResponse)
def shorten_url(request: URLRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    short_code = generate_short_code()
    short_url = f"http://localhost:8000/{short_code}"
    db_url = URL(short_code=short_code, original_url=str(request.original_url), owner_id=current_user.id, click_count=0)
    db.add(db_url)
    db.commit()
    db.refresh(db_url)
    return URLResponse(
        short_url=short_url,
        original_url=db_url.original_url,
        click_count=db_url.click_count
    )

# Link yönlendirme ve tıklanma sayacı arttırma
@app.get("/{short_code}")
def redirect_to_original(short_code: str, db: Session = Depends(get_db)):
    db_url = db.query(URL).filter(URL.short_code == short_code).first()
    if not db_url:
        raise HTTPException(status_code=404, detail="Link bulunamadı.")
    db_url.click_count += 1
    db.commit()
    return RedirectResponse(db_url.original_url)

# Kullanıcının tüm linkleri ve tıklanma sayıları
@app.get("/links", response_model=List[URLResponse])
def get_links(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    urls = db.query(URL).filter(URL.owner_id == current_user.id).all()
    return [
        URLResponse(
            short_url=f"http://localhost:8000/{url.short_code}",
            original_url=url.original_url,
            click_count=url.click_count
        ) for url in urls
    ]
