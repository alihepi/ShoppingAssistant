import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/MainPage.css';

const MainPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Eğer kullanıcı zaten giriş yapmışsa HomePage'e yönlendir
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
            navigate('/home');
        }
    }, [navigate]);

    return (
        <div className="main-container">
            <div className="main-content">
                <div className="brand-section">
                    <h1 className="brand-title">ShopAssist</h1>
                    <p className="brand-subtitle">Alışveriş Asistanınız</p>
                </div>

                <div className="info-section">
                    <h2>Size Nasıl Yardımcı Olabiliriz?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🔍</div>
                            <h3>Akıllı Ürün Önerileri</h3>
                            <p>Yapay zeka destekli asistanımız size en uygun ürünleri önerir.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💬</div>
                            <h3>Kolay İletişim</h3>
                            <p>Doğal dil ile iletişim kurarak istediğiniz ürünleri bulun.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">❤️</div>
                            <h3>Favori Listesi</h3>
                            <p>Beğendiğiniz ürünleri kaydedin, daha sonra kolayca ulaşın.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🎯</div>
                            <h3>Kişiselleştirilmiş Deneyim</h3>
                            <p>Size özel ürün önerileri ve fırsatlardan haberdar olun.</p>
                        </div>
                    </div>
                </div>

                <div className="action-section">
                    <h2>Hemen Başlayın</h2>
                    <div className="action-buttons">
                        <button 
                            className="action-button login-button"
                            onClick={() => navigate('/login')}
                        >
                            Giriş Yap
                        </button>
                        <button 
                            className="action-button register-button"
                            onClick={() => navigate('/register')}
                        >
                            Kayıt Ol
                        </button>
                    </div>
                    <p className="action-note">
                        Ücretsiz hesap oluşturarak tüm özelliklere erişin!
                    </p>
                </div>
            </div>

            <footer className="main-footer">
                <p>&copy; 2024 ShopAssist. Tüm hakları saklıdır.</p>
            </footer>
        </div>
    );
};

export default MainPage;