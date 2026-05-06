import MainLayout from "../../components/layout/MainLayout";
import Button from "../../components/ui/Button";
import { useNavigate, Link } from "react-router-dom";
import DarkModeToggle from "../../components/ui/DarkModeToggle"; // ✅ ADD THIS
import api from "../../api/axios";
import Swal from "sweetalert2";

function Settings() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const handleDeleteAccount = async () => {
        const result = await Swal.fire({
            title: "Delete your account?",
            text: "This action cannot be undone. All your data will be permanently removed.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444", // red
            cancelButtonColor: "#6b7280", // gray
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete("/users/me");

            await Swal.fire({
                title: "Deleted!",
                text: "Your account has been removed.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });

            localStorage.removeItem("token");
            window.location.href = "/";

        } catch (err) {
            console.error(err);

            Swal.fire({
                title: "Error",
                text: "Something went wrong. Try again.",
                icon: "error",
            });
        }
    };

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-6 dark:text-white dark:bg-app-dark dark:shadow-white">

                <h1 className="text-2xl font-bold mb-6">Settings</h1>

                {/* ACCOUNT */}
                <div className="mb-6">
                    <h2 className="text-sm font-semibold text-slate-500 mb-3 dark:text-white">Account</h2>

                    <Link to="/edit-profile">
                        <Button className="w-full mb-3 ">
                            Edit Profile
                        </Button>
                    </Link>

                    <Link to="/change-password">
                        <Button className="w-full ">
                            Change Password
                        </Button>
                    </Link>
                </div>

                {/* 🔥 APPEARANCE (NEW SECTION) */}
                <div className="mb-6">
                    <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 dark:text-white">
                        Appearance
                    </h2>

                    <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
                        <span className="text-sm text-slate-700 dark:text-slate-200">
                            Dark Mode
                        </span>

                        <DarkModeToggle />
                    </div>
                </div>

                {/* LOGOUT */}
                <div className="mt-8">
                    <Button
                        onClick={handleLogout}
                        className="w-full bg-red-500 hover:bg-red-600 text-white"
                    >
                        Log Out
                    </Button>
                </div>
                {/* DANGER ZONE */}
                <div className="mt-10 border-t pt-6">
                    <h2 className="text-sm font-semibold text-red-500 mb-3">
                        Danger Zone
                    </h2>

                    <Button
                        onClick={handleDeleteAccount}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                        Delete Account Permanently
                    </Button>
                </div>

            </div>
        </MainLayout>
    );
}

export default Settings;