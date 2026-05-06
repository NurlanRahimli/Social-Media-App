import { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Button from "../../components/ui/Button";
import api from "../../api/axios";
import Swal from "sweetalert2";

function ForgotPassword() {
    const [email, setEmail] = useState("");

    const handleSubmit = async () => {
        if (!email) {
            return Swal.fire("Error", "Email is required", "error");
        }

        try {
            const res = await api.post("/auth/forgot-password", { email });

            // 🔥 for now show link (since you're not using email yet)
            await Swal.fire({
                title: "Check your email 📩",
                text: "We sent you a password reset link. Please check your inbox.",
                icon: "success",
                confirmButtonColor: "#833ab4",
            });

        } catch (err) {
            await Swal.fire({
                title: "Check your email 📩",
                text: "If an account exists, we sent a reset link.",
                icon: "success",
            });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-app-light px-4 dark:bg-app-dark">
            <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm text-center dark:text-white dark:bg-app-dark dark:border-2 dark:border-[#282f3c]">

                <h1 className="text-xl font-bold mb-4">
                    Forgot Password
                </h1>

                <p className="text-sm text-slate-500 mb-4">
                    Enter your email and we’ll send you a reset link.
                </p>

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-lg p-2 mb-4 outline-none"
                />

                <Button onClick={handleSubmit} className="w-full">
                    Send Reset Link
                </Button>
            </div>
        </div>
    );
}

export default ForgotPassword;