import { useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/useAuth";

function Login() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.type === "email" ? "email" : "password"]: e.target.value,
        });
    };

    const handleLogin = async () => {
        try {
            setError("");

            const res = await api.post("/auth/login", form);

            // Save token
            localStorage.setItem("token", res.data.token);

            // 🔥 IMPORTANT: update global user
            setUser(res.data.user);

            // Redirect
            navigate("/home");

        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-app-light px-4 dark:bg-app-dark">
            <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-sm dark:bg-app-dark">

                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Login to continue to SocialApp
                    </p>
                </div>

                <div className="space-y-4">
                    <Input
                        type="email"
                        placeholder="Email address"
                        value={form.email}
                        onChange={handleChange}
                        className="dark:text-white dark:bg-app-dark"
                    />

                    <Input
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="dark:text-white dark:bg-app-dark"
                    />

                    <div className="text-right">
                        <Link
                            to="/forgot-password"
                            className="font-semibold text-insta-pink text-sm"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <Button className="w-full" onClick={handleLogin}>
                        Login
                    </Button>
                </div>

                <p className="mt-5 text-center text-sm text-slate-500">
                    Don’t have an account?{" "}
                    <Link to="/register" className="font-semibold text-insta-pink">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;