import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShopAssistAPIService from '../services/ShopAssistAPIService';
import '../css/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  if (loading) {
    return <div className="admin-dashboard loading">Yükleniyor...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <button onClick={() => navigate('/admin/settings')} className="settings-btn">
            Ayarlar
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Çıkış Yap
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="admin-info-card">
          <h2>Admin Bilgileri</h2>
          {admin && (
            <>
              <p><strong>Kullanıcı Adı:</strong> {admin.username}</p>
              <p><strong>İşletme Adı:</strong> {admin.businessName}</p>
            </>
          )}
        </div>
        
        {/* Buraya ek dashboard widgetları eklenebilir */}
      </div>
    </div>
  );
};

export default AdminDashboard;