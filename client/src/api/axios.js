// /src/api/axios.js
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Attach token automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Optional: handle expired token
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/"; // redirect to login
        }
        return Promise.reject(err);
    }
);

export default api;