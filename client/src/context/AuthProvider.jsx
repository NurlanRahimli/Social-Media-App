import { useEffect, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./authContext";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.log("No token, skip /auth/me");
            return; // 🚫 STOP HERE
        }

        const fetchUser = async () => {
            try {
                const res = await api.get("/auth/me");
                setUser(res.data.user);
            } catch (err) {
                console.log("Not logged in");
                setUser(null);
            }
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};