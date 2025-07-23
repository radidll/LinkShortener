# 🔗 Link Kısaltıcı Api + Arayüz ( Backend + Frontend)  (URL Shortener)

Bu proje, kullanıcıların uzun bağlantıları kısaltmalarını ve bu bağlantıları yönetmelerini sağlayan tam işlevli bir **Link Kısaltma Uygulamasıdır**. Kullanıcı bazlı geçmiş yönetimi, oturum sistemi, QR kod oluşturma (isteğe bağlı), modern bir arayüz ve FastAPI destekli backend mimarisi ile geliştirilmiştir.

## 🚀 Özellikler

- 🔐 Kullanıcı Girişi ve Kayıt Olma
- 📌 Kullanıcıya özel kısaltılmış bağlantılar
- 🔢 Tıklanma Sayısı Takibi
- 🕓 Geçmiş Bağlantılar Kalıcı Olarak Saklanır (Silinmez)
- 🌐 React tabanlı modern frontend
- 🖤 Siyah temalı, profesyonel arayüz
- 🎨 Yumuşak kenarlar, aydınlatmalı butonlar
- 🧪 Backend: FastAPI + SQLAlchemy + PostgreSQL

---

## 🛠️ Kullanılan Teknolojiler

### Backend
- Python 3.10+
- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT (Authentication)
- Passlib (Şifreleme)
- Alembic (Veritabanı Migrations)

### Frontend
- React (v19)
- React Hooks
- CSS ile özelleştirilmiş tasarım
- Axios (API İstekleri)

---

## 📦 Kurulum Talimatları

### 1. Backend Kurulumu

```bash
# Sanal ortam oluştur
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Gereken paketleri yükle
pip install -r requirements.txt

# Veritabanı bağlantısı için .env dosyası oluştur
echo DATABASE_URL=postgresql://postgres:şifre@localhost:5432/General > .env

# Veritabanını oluştur
python create_db.py

# Uygulamayı başlat
uvicorn main:app --reload

cd frontend

# Paketleri yükle
npm install

# Uygulamayı başlat
npm start


🧪 Kullanım

Kayıt Olun: Bir kullanıcı adı ve şifre ile kayıt olun.

Giriş Yapın: Hesabınızla oturum açın.

Bağlantı Kısaltın: Uzun URL'yi girin, "Kısalt" butonuna tıklayın.

Geçmişe Bakın: Daha önce oluşturduğunuz tüm kısaltmalar sağda listelenir.

Tıklanma Sayısı: Her bağlantının kaç kez tıklandığı gösterilir.

Oturumu Kapatmak İçin: Sağ üstteki "Çıkış Yap" butonuna basın.


🔒 Güvenlik

Şifreler bcrypt algoritmasıyla güvenli şekilde saklanır.

JWT ile oturum yönetimi yapılır.

Sadece kullanıcıya ait bağlantılar görüntülenebilir.