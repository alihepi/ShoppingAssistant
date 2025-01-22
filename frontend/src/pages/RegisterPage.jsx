import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShopAssistAPIService from '../services/ShopAssistAPIService';
import '../css/RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setError('Tüm alanları doldurunuz');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };
      
      await ShopAssistAPIService.registerUser(userData);
      navigate('/login');
    } catch (err) {
      console.error('Kayıt hatası:', err);

      if (err.response) {
        // Sunucudan hata yanıtı geldi
        setError(err.response.data.message || 'Kayıt işlemi başarısız');
      } else if (err.request) {
        // Sunucuya istek ulaşmadı
        setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        // İstek oluşturulurken hata oluştu
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Kayıt Ol</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username">Kullanıcı Adı</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={3}
              placeholder="Kullanıcı adınızı giriniz"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="E-posta adresinizi giriniz"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
              placeholder="Şifrenizi giriniz"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Şifre Tekrar</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
              placeholder="Şifrenizi tekrar giriniz"
            />
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="login-link">
          Zaten hesabınız var mı? {' '}
          <a href="/login" onClick={(e) => {
            e.preventDefault();
            navigate('/login');
          }}>
            Giriş Yap
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;