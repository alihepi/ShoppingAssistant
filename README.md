# Shopping Assistant

Shopping Assistant, kullanıcıların alışveriş deneyimini geliştirmek için tasarlanmış, yapay zeka destekli bir e-ticaret asistanı uygulamasıdır. Bu proje, modern web teknolojileri ve mikroservis mimarisi kullanılarak geliştirilmiştir.

## Özellikler

- ✨ Yapay zeka destekli alışveriş asistanı
- 🔒 Kullanıcı ve admin yetkilendirme sistemi
- 🌐 Mikroservis mimarisi
- 💬 Gerçek zamanlı chatbot desteği
- 🔍 Akıllı ürün arama ve önerme sistemi
- 🛍️ Kullanıcı dostu arayüz

## Teknolojiler

### Frontend
- React.js
- Vite
- React Router DOM
- Bootstrap
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- API Gateway
- Mikroservis Mimarisi

### Python (AI/ML)
- Flask
- NLTK
- Beautiful Soup
- Selenium
- Transformers

## Gereksinimler

- Node.js (v18 veya üzeri)
- Python (3.8 veya üzeri)
- MongoDB
- Chrome WebDriver (web crawler için)

## Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/alihepi/ShoppingAssistant.git
cd shopping-assistant
```

2. Gerekli paketleri yükleyin:
```bash
npm install
```

3. Python sanal ortamını oluşturun ve gerekli paketleri yükleyin:
```bash
cd python
python -m venv venv
source venv/bin/activate  # Linux/macOS
# veya
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

4. Gerekli .env dosyalarını oluşturun:

Backend servisleri için (.env dosyaları admin-service ve user-service klasörlerinde):
```env
MONGO_URI=mongodb://localhost:27017/shopping-assistant
PORT=5001  # user-service için
PORT=5002  # admin-service için
JWT_SECRET=your_jwt_secret
```

## Çalıştırma

Tüm servisleri tek bir komutla başlatmak için:

```bash
npm start
```

Bu komut aşağıdaki servisleri başlatacaktır:
- Frontend (http://localhost:5173)
- API Gateway (http://localhost:5000)
- User Service (http://localhost:5001)
- Admin Service (http://localhost:5002)
- Chatbot Service (http://localhost:5025)

## Proje Yapısı

```
SHOPPINGASSISTANT/
├── backend/
│   ├── admin-service/    # Admin yönetim servisi
│   ├── gateway/          # API Gateway
│   ├── user-service/     # Kullanıcı yönetim servisi
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── python/
│   ├── chatbot_api.py    # Chatbot API servisi
│   ├── chatbot.py        # Chatbot mantığı
│   └── web_crawler_v9.3.py # Ürün verileri toplama
└── package.json
```

## API Endpoints

### User Service (localhost:5001)
- POST /api/users/register - Yeni kullanıcı kaydı
- POST /api/users/login - Kullanıcı girişi
- PUT /api/users/:id - Kullanıcı bilgilerini güncelleme
- DELETE /api/users/:id - Kullanıcı silme

### Admin Service (localhost:5002)
- POST /api/admins/register - Yeni admin kaydı
- POST /api/admins/login - Admin girişi
- PUT /api/admins/:id - Admin bilgilerini güncelleme
- DELETE /api/admins/:id - Admin silme

### Chatbot Service (localhost:5025)
- POST /api/chatbot - Chatbot ile etkileşim

## Geliştirme

1. Frontend geliştirmesi için:
```bash
cd frontend
npm run dev
```

2. Backend servislerini ayrı ayrı çalıştırmak için:
```bash
cd backend/admin-service
npm run dev

cd backend/user-service
npm run dev

cd backend/gateway
npm run dev
```

3. Chatbot servisini çalıştırmak için:
```bash
cd python
python chatbot_api.py
```

## Web Crawler Kullanımı

Web crawler'ı çalıştırmak için:

```bash
cd python
python web_crawler_v9.3.py
```

Crawler çalıştırıldığında:
1. Base URL girmeniz istenecektir
2. Otomatik olarak ürünleri tarayacak ve JSON formatında kaydedecektir
3. Progress durumu console'da gösterilecektir

## Katkıda Bulunma

1. Fork'layın
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

## İletişim

Your Name - [@alihappy_](https://www.instagram.com/alihappy_) - aliimutlu@hotmail.com

Project Link: [https://github.com/alihepi/ShoppingAssistant](https://github.com/alihepi/ShoppingAssistant)
