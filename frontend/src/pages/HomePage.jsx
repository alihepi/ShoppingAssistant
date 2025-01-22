import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatProduct from '../components/ChatProducts';
import FavoriteProduct from '../components/FavoriteProduct';
import ShopAssistAPIService from '../services/ShopAssistAPIService';

const HomePage = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const chatContainerRef = useRef(null);
    const userMenuRef = useRef(null);

    // Kullanıcı menüsünü dışarı tıklandığında kapatma
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Kullanıcı oturumunu kontrol et
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
            navigate('/login');
            return;
        }

        setUser(JSON.parse(storedUser));
        // Kullanıcının favorilerini yükle
        loadFavorites();
    }, [navigate]);

    const loadFavorites = async () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            if (user?.favorites) {
                setFavorites(user.favorites);
            }
        } catch (error) {
            console.error('Favoriler yüklenirken hata:', error);
        }
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Chatbot'a mesaj gönderme
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || loading) return;

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            // Kullanıcı mesajını ekle
            setMessages(prev => [...prev, { type: 'user', content: message }]);

            // Chatbot'a mesaj gönder
            const response = await ShopAssistAPIService.sendMessageToChatbot(message, token);

            // Chatbot yanıtını ve ürün bilgisini ekle
            if (response) {
                const { response: botResponse, product } = response;

                // Yanıtı ekle
                setMessages(prev => [...prev, { 
                    type: 'ai', 
                    content: botResponse || 'Size bir ürün önerebilirim:',
                }]);

                // Eğer ürün varsa, ürün kartını ekle
                if (product) {
                    const productData = {
                        img: product.img_url || '/placeholder.jpg', // API'den gelen resim URL'i
                        name: product.name,
                        features: product.features ? Object.entries(product.features)
                            .map(([key, value]) => `${key}: ${value}`).join(', ') : '',
                        seller: 'hepsiburada.com',
                        url: product.url,
                        price: product.price
                    };

                    setMessages(prev => [...prev, { 
                        type: 'ai',
                        product: productData
                    }]);
                }
            }
        } catch (error) {
            console.error('Mesaj gönderilirken hata:', error);
            setMessages(prev => [...prev, { 
                type: 'ai', 
                content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.' 
            }]);
        } finally {
            setLoading(false);
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const addToFavorites = async (product) => {
        try {
            const updatedUser = {...user};
            updatedUser.favorites = [...(user.favorites || []), product];
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setFavorites(prev => [...prev, product]);
            
            setMessages(prev => [...prev, { 
                type: 'ai', 
                content: 'Ürün favorilerinize eklendi!' 
            }]);
        } catch (error) {
            console.error('Favorilere eklenirken hata:', error);
            setMessages(prev => [...prev, { 
                type: 'ai', 
                content: 'Ürün favorilere eklenirken bir hata oluştu.' 
            }]);
        }
    };

    const removeFromFavorites = async (productToRemove) => {
        try {
            const updatedUser = {...user};
            updatedUser.favorites = user.favorites.filter(
                product => product.url !== productToRemove.url
            );
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setFavorites(prev => prev.filter(product => product.url !== productToRemove.url));
            
            setMessages(prev => [...prev, { 
                type: 'ai', 
                content: 'Ürün favorilerinizden kaldırıldı!' 
            }]);
        } catch (error) {
            console.error('Favorilerden kaldırılırken hata:', error);
            setMessages(prev => [...prev, { 
                type: 'ai', 
                content: 'Ürün favorilerden kaldırılırken bir hata oluştu.' 
            }]);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="app-container">
            <div className="left-panel">
                <div className="panel-header">
                    <h1 id="fav-list-title">Favoriler</h1>
                </div>
                <div className="panel-content">
                    <div className="lp-chats">
                        {favorites.length > 0 ? (
                            favorites.map((product, index) => (
                                <FavoriteProduct
                                    key={`${product.url}-${index}`}
                                    product={product}
                                    onRemove={() => removeFromFavorites(product)}
                                />
                            ))
                        ) : (
                            <p>Favorilerde ürün yok.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="right-panel">
                <div className="panel-header">
                    <h1 className="welcome-title">
                        Hoş Geldin, {user?.username || 'Misafir'}
                    </h1>
                    <div className="user-menu-container" ref={userMenuRef}>
                        <button 
                            className="user-menu-button"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <i className="fas fa-user-circle"></i>
                        </button>
                        {showUserMenu && (
                            <div className="user-menu">
                                <button 
                                    className="menu-item"
                                    onClick={() => navigate('/profile')}
                                >
                                    <i className="fas fa-cog"></i>
                                    Hesap Ayarları
                                </button>
                                <button 
                                    className="menu-item"
                                    onClick={handleLogout}
                                >
                                    <i className="fas fa-sign-out-alt"></i>
                                    Çıkış Yap
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="panel-content" ref={chatContainerRef}>
                    <div className="rp-chats">
                        {messages.map((msg, index) => (
                            <div key={index} className={`${msg.type}-chat fade-in`}>
                                {msg.content}
                                {msg.product && (
                                    <ChatProduct 
                                        productData={msg.product}
                                        onAddToFavorites={addToFavorites}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="panel-footer">
                    <div className="question-input-container">
                        <input
                            type="text"
                            placeholder={loading ? 'Yanıt bekleniyor...' : 'Bir mesaj yazın...'}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="message-input"
                            disabled={loading}
                        />
                        <button
                            className="send-button chat-btn"
                            disabled={!message.trim() || loading}
                            onClick={handleSendMessage}
                        >
                            {loading ? 'Gönderiliyor...' : 'Gönder'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;