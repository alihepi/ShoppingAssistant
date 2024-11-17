# Shopping Assistant Project

## Kurulum

Projeyi çalıştırmak için ***python*** klasöründe aşağıdaki adımları takip edin:

**1.** Python sanal ortamı ***(venv)*** oluşturun:
```bash
python -m venv venv
```

**2.** Gerekli kütüphaneleri yükleyin:
```bash
pip install json5 pathlib nltk transformers requests beautifulsoup4 selenium webdriver-manager psutil
```

**3.** NLTK kurulumunu tamamlayın:
```bash
python setup_nltk.py
```

**4.** Şimdi ise sırası ile önce **web_crawler_v7.1.py** dosyasını çalıştırarak istenilen alışveriş sitesinde tarama yapabilir; ardından **v5.9_script.py** dosyasında bulunan ***json_path*** değişkenine dosyayı belirtip, **v5.9_script.py** dosyasını çalıştırarak chat ile arama yapabilirsiniz.

<br/>

---

<br/>

## Proje Hakkında

### Amaç
Online alışverişlerde sıkça karşılaşılan ürün arama zorluklarını gidermek amacıyla, müşterilerin istedikleri ürünü birkaç anahtar kelimeyle tarif ederek doğrudan ulaşabilecekleri bir platform oluşturmaktır. Bu platform, müşterilerin alışveriş deneyimini iyileştirmek ve aradıkları ürünlere daha hızlı erişmelerini sağlamak için tasarlanmıştır.

### Hedefler
- **Müşteri Memnuniyetini Artırmak**: Kullanıcıların alışveriş süreçlerini daha sorunsuz ve keyifli hale getirmek.
- **Alışveriş Kalitesini Yükseltmek**: Daha doğru ve hızlı ürün aramaları sağlayarak kaliteyi artırmak.
- **Tehditkar İçeriklerin Tespiti**: Kullanıcılar tarafından tehlikeli/tehditkar içeriklerin aranması durumunda hesabın takibe alınarak kısıtlanması, üst üste yapılan benzer aramalarda hesap bilgilerinin yöneticilerle paylaşılarak uyarılmaları.
- **Kişiselleştirilmiş Öneriler**: Kullanıcıların ilgi alanlarına uygun, akıllı ve kişiselleştirilmiş ürün tavsiyeleri sunmak.

## Kullanılması Planlanan Teknolojiler

### Frontend
- React
- JavaScript
- Bootstrap
- CSS

### Backend
- NodeJS
- Express
- MongoDB
- AWS
- JWT
- Docker

### Yapay Zeka
#### Large Language Models (LLM)
- Hugging Face Transformers
- OpenAI
- Rasa
- PyTorch ve TensorFlow

#### Natural Language Processing (NLP)
- Hugging Face Transformers
- spaCy
- NLTK (Natural Language Toolkit)
- Stanford NLP
- TextBlob
- OpenAI GPT (OpenAI API)

#### Image Processing (IP)
- OpenCV
- Pillow (PIL Fork)
- TensorFlow ve Keras
