from LinkShortener.database import engine, Base
from LinkShortener.models import User, URL

Base.metadata.create_all(bind=engine)
print("Tablolar oluşturuldu.")
