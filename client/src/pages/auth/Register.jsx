import { useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Swal from "sweetalert2";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");

    const usernameRegex = /^[a-z0-9._]+$/;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: name === "username"
                ? value.toLowerCase().replace(/\s/g, "") // remove spaces
                : value,
        });
    };

    const handleRegister = async () => {
        try {
            setError("");

            if (!usernameRegex.test(form.username)) {
                return setError(
                    "Username can only contain lowercase letters, numbers, dots and underscores"
                );
            }

            if (form.password !== form.confirmPassword) {
                return setError("Passwords do not match");
            }

            await api.post("/auth/register", {
                username: form.username,
                email: form.email,
                password: form.password,
            });

            // SHOW SUCCESS ALERT
            await Swal.fire({
                title: "Check your email 📩",
                text: `Verification link sent to ${form.email}. Please verify your email before logging in.`,
                icon: "success",
                confirmButtonColor: "#833ab4",
            });

            // Redirect AFTER user clicks OK
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-app-light px-4 py-8 dark:bg-app-dark">
            <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-sm dark:bg-app-dark">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Create account
                    </h2>
                </div>

                <div className="space-y-4">

                    <Input
                        name="username"
                        type="text"
                        placeholder="Username (no spaces)"
                        onChange={handleChange}
                        className="dark:text-white dark:bg-app-dark"
                    />

                    <Input
                        name="email"
                        type="email"
                        placeholder="Email address"
                        onChange={handleChange}
                        className="dark:text-white dark:bg-app-dark"
                    />

                    <Input
                        name="password"
                        type="password"
                        placeholder="Password"
                        onChange={handleChange}
                        className="dark:text-white dark:bg-app-dark"
                    />

                    <Input
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        onChange={handleChange}
                        className="dark:text-white dark:bg-app-dark"
                    />

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <Button className="w-full" onClick={handleRegister}>
                        Create Account
                    </Button>
                </div>

                <p className="mt-5 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link to="/" className="font-semibold text-insta-pink">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;