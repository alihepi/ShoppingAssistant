import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShopAssistAPIService from '../services/ShopAssistAPIService';
import '../css/AdminLoginPage.css';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await ShopAssistAPIService.loginAdmin(credentials);
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminId', response.data.admin.id);
      localStorage.setItem('adminData', JSON.stringify(response.data.admin));
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Geçersiz kullanıcı adı veya şifre');
    }
  };
  
  return (
    <div className="admin-login-container">
      <div className="login-box">
        <h1>Admin Giriş</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Kullanıcı Adı"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Şifre"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit">Giriş Yap</button>
        </form>
        <p className="register-link">
          Hesabınız yok mu? <a href="/admin/register">Kayıt Ol</a>
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;