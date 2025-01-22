import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShopAssistAPIService from '../services/ShopAssistAPIService';
import '../css/ProfileSettings.css';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        navigate('/login');
        return;
      }

      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          username: userData.username,
          email: userData.email
        }));
      } catch (err) {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      setLoading(false);
      navigate('/login');
      return;
    }

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Yeni şifreler eşleşmiyor');
        setLoading(false);
        return;
      }
      if (!formData.currentPassword) {
        setError('Mevcut şifrenizi girmelisiniz');
        setLoading(false);
        return;
      }
    }

    try {
      const updateData = {
        username: formData.username,
        email: formData.email
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await ShopAssistAPIService.updateUser(
        user.id,
        updateData,
        token
      );

      if (response.data) {
        const updatedUser = {
          ...user,
          username: formData.username,
          email: formData.email
        };
        
        // Hassas verileri localStorage'da güvenli bir şekilde saklama
        localStorage.setItem('user', JSON.stringify({
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email
        }));
        
        setUser(updatedUser);
        setSuccess('Profil bilgileriniz başarıyla güncellendi');
        
        // Şifre alanlarını temizle
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        localStorage.clear();
        navigate('/login');
      } else {
        setError('Güncelleme sırasında bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          navigate('/login');
          return;
        }

        await ShopAssistAPIService.deleteUser(user.id, token);
        
        localStorage.clear();
        navigate('/login');
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          localStorage.clear();
          navigate('/login');
        } else {
          setError('Hesap silme işlemi sırasında bir hata oluştu');
        }
      }
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  if (!user) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="profile-settings-container">
      <div className="profile-settings-card">
        <h2>Profil Ayarları</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="profile-settings-form">
          <div className="form-group">
            <label htmlFor="username">Kullanıcı Adı</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
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
            />
          </div>

          <div className="password-section">
            <h3>Şifre Değiştir</h3>
            <div className="form-group">
              <label htmlFor="currentPassword">Mevcut Şifre</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Yeni Şifre</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Yeni Şifre Tekrar</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="update-button"
            disabled={loading}
          >
            {loading ? 'Güncelleniyor...' : 'Bilgileri Güncelle'}
          </button>
        </form>

        {/* Geri dön butonu */}
        <button
          type="button"
          className="back-button"
          onClick={handleBack}
        >
          Geri Dön
        </button>

        <div className="danger-zone">
          <button 
            type="button"
            className="delete-account-button"
            onClick={handleDeleteAccount}
          >
            Hesabı Sil
          </button>
          <p className="warning-text">
            Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;