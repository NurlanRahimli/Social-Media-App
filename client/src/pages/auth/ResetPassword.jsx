import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import api from "../../api/axios";
import Swal from "sweetalert2";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async () => {
        if (!newPassword || !confirmPassword) {
            return Swal.fire("Error", "All fields are required", "error");
        }

        if (newPassword !== confirmPassword) {
            return Swal.fire("Error", "Passwords do not match", "error");
        }

        if (newPassword.length < 6) {
            return Swal.fire("Error", "Password must be at least 6 characters", "error");
        }

        try {
            await api.post(`/auth/reset-password/${token}`, {
                newPassword,
                confirmPassword,
            });

            await Swal.fire("Success", "Password reset successfully!", "success");

            navigate("/");

        } catch (err) {
            Swal.fire(
                "Error",
                err.response?.data?.message || "Invalid or expired link",
                "error"
            );
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-app-light px-4">
            <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm">

                <h1 className="text-xl font-bold mb-4 text-center">
                    Reset Password
                </h1>

                <div className="space-y-4">
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border rounded-lg p-2"
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border rounded-lg p-2"
                    />

                    <Button onClick={handleSubmit} className="w-full">
                        Reset Password
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;