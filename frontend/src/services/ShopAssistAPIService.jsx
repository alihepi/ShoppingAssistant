import http from "./http-common";

// Token bazlı headers için config fonksiyonu
const config = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Kullanıcı servisleri
const registerUser = async (userData) => {
  try {
    const response = await http.post("/users/register", userData);
    return response;
  } catch (error) {
    throw error;
  }
};

const loginUser = async (credentials) => {
  try {
    const response = await http.post("/users/login", credentials);
    return response;
  } catch (error) {
    throw error;
  }
};

const updateUser = async (id, updatedData, token) => {
  try {
    const response = await http.put(`/users/${id}`, updatedData, config(token));
    return response;
  } catch (error) {
    throw error;
  }
};

const deleteUser = async (id, token) => {
  return await http.delete(`/users/${id}`, config(token));
};

// Admin servisleri
const registerAdmin = async (adminData) => {
  try {
    const response = await http.post("/admins/register", adminData);
    return response;
  } catch (error) {
    throw error;
  }
};

const loginAdmin = async (credentials) => {
  try {
    const response = await http.post("/admins/login", credentials);
    return response;
  } catch (error) {
    throw error;
  }
};

const updateAdmin = async (id, updatedData, token) => {
  try {
    const response = await http.put(`/admins/${id}`, updatedData, config(token));
    return response;
  } catch (error) {
    throw error;
  }
};

const deleteAdmin = async (id, token) => {
  return await http.delete(`/admins/${id}`, config(token));
};

// Chatbot servisleri
const sendMessageToChatbot = async (message, token) => {
  try {
    const response = await http.post("/chatbot", { query: message }, config(token));
    return response.data;
  } catch (error) {
    console.error("Chatbot hatası:", error.response || error);
    throw error;
  }
};

// Export edilen tüm servisler
const ShopAssistAPIService = {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  registerAdmin,
  loginAdmin,
  updateAdmin,
  deleteAdmin,
  sendMessageToChatbot,
};

export default ShopAssistAPIService;