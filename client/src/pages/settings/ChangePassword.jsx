import { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Button from "../../components/ui/Button";
import api from "../../api/axios";
import Swal from "sweetalert2";

function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            return Swal.fire("Error", "All fields are required", "error");
        }

        if (newPassword !== confirmPassword) {
            return Swal.fire("Error", "Passwords do not match", "error");
        }

        if (newPassword.length < 6) {
            return Swal.fire(
                "Error",
                "Password must be at least 6 characters",
                "error"
            );
        }

        try {
            await api.put("/users/profile/change-password", {
                currentPassword,
                newPassword,
            });

            Swal.fire("Success", "Password updated!", "success");

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (err) {
            Swal.fire(
                "Error",
                err.response?.data?.message || "Something went wrong",
                "error"
            );
        }
    };

    return (
        <MainLayout>
            <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm dark:text-white dark:bg-app-dark">

                <h1 className="text-xl font-bold mb-6">Change Password</h1>

                <div className="space-y-4">
                    <input
                        type="password"
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full border rounded-lg p-2 dark:text-white dark:bg-app-dark"
                    />

                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border rounded-lg p-2"
                    />

                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border rounded-lg p-2"
                    />

                    <Button onClick={handleSubmit} className="w-full">
                        Update Password
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
}

export default ChangePassword;