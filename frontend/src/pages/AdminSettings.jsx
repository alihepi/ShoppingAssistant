import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShopAssistAPIService from '../services/ShopAssistAPIService';
import '../css/AdminSettings.css';

const AdminSettings = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    businessName: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      const parsedData = JSON.parse(adminData);
      setFormData(prev => ({
        ...prev,
        username: parsedData.username,
        businessName: parsedData.businessName
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    try {
      const adminId = localStorage.getItem('adminId');
      const token = localStorage.getItem('adminToken');
      
      if (!adminId || !token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        navigate('/admin/login');
        return;
      }
  
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
  
      await ShopAssistAPIService.updateAdmin(adminId, updateData, token);
      setSuccess('Bilgileriniz başarıyla güncellendi');
      
      // Local storage güncelleme
      const updatedAdminData = {
        id: adminId,
        username: formData.username,
        businessName: formData.businessName
      };
      localStorage.setItem('adminData', JSON.stringify(updatedAdminData));
      
    } catch (err) {
      if (err.message.includes('Yetkilendirme hatası')) {
        navigate('/admin/login');
      }
      setError(err.message || 'Güncelleme sırasında bir hata oluştu');
    }
  };

  const handleDelete = async () => {
    try {
      const adminId = localStorage.getItem('adminId');
      const token = localStorage.getItem('adminToken');
      await ShopAssistAPIService.deleteAdmin(adminId, token);
      
      // Local storage'ı temizle ve login sayfasına yönlendir
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminId');
      localStorage.removeItem('adminData');
      navigate('/admin/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Hesap silme sırasında bir hata oluştu');
    }
  };

  return (
    <div className="admin-settings">
      <div className="settings-container">
        <h1>Admin Ayarları</h1>
        
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Kullanıcı Adı</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>İşletme Adı</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Yeni Şifre (Opsiyonel)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Şifreyi değiştirmek için doldurun"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="button-group">
            <button type="submit" className="update-btn">
              Bilgileri Güncelle
            </button>
            <button 
              type="button" 
              className="back-btn"
              onClick={() => navigate('/admin/dashboard')}
            >
              Dashboard'a Dön
            </button>
          </div>
        </form>

        <div className="danger-zone">
          {!showDeleteConfirm ? (
            <button 
              className="delete-btn"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Hesabı Sil
            </button>
          ) : (
            <div className="delete-confirm">
              <p>Bu işlem geri alınamaz. Emin misiniz?</p>
              <div className="confirm-buttons">
                <button 
                  className="confirm-delete-btn"
                  onClick={handleDelete}
                >
                  Evet, Hesabı Sil
                </button>
                <button 
                  className="cancel-delete-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  İptal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;