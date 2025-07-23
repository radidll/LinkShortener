from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from LinkShortener.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    urls = relationship("URL", back_populates="owner")

class URL(Base):
    __tablename__ = "urls"
    id = Column(Integer, primary_key=True, index=True)
    short_code = Column(String, unique=True, index=True)
    original_url = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    click_count = Column(Integer, default=0)  # Tıklanma sayacı alanı
    owner = relationship("User", back_populates="urls")
