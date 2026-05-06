import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Button from "../../components/ui/Button";
import api from "../../api/axios";
import { User } from "lucide-react";

function EditProfile() {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [error, setError] = useState("");
    const [bio, setBio] = useState("");

    const [usernameStatus, setUsernameStatus] = useState("");
    const [checking, setChecking] = useState(false);


    const handleRemoveImage = async () => {
        try {
            const formData = new FormData();
            formData.append("removeProfileImage", "true");

            await api.put("/users/profile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setPreview(null);

        } catch (err) {
            console.error(err);
        }
    };


    useEffect(() => {
        const fetchUser = async () => {
            const res = await api.get("/auth/me");
            setUser(res.data.user);
            setUsername(res.data.user.username);
            setPreview(res.data.user.profileImage?.url || null);
            setBio(res.data.user.bio || "");
        };

        fetchUser();
    }, []);


    // REAL-TIME USERNAME CHECK
    useEffect(() => {
        if (!user) return;

        const delay = setTimeout(async () => {
            try {
                if (!username || username.length < 3) {
                    setUsernameStatus("");
                    return;
                }

                // if empty or unchanged → reset state
                if (!username || username === user.username) {
                    setUsernameStatus("");
                    return;
                }

                setChecking(true);

                const res = await api.get(
                    `/users/check-username?username=${username}`
                );

                setUsernameStatus(res.data.available ? "available" : "taken");

            } catch (err) {
                console.error(err);
            } finally {
                setChecking(false);
            }
        }, 500);

        return () => clearTimeout(delay);
    }, [username, user]);



    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);

        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };


    const usernameRegex = /^[a-z0-9._]+$/;



    const handleSubmit = async () => {
        try {
            setError("");

            if (!usernameRegex.test(username)) {
                return setError(
                    "Username can only contain lowercase letters, numbers, dots and underscores"
                );
            }

            if (usernameStatus === "taken") {
                return setError("Username is already taken");
            }

            const formData = new FormData();
            formData.append("username", username);
            formData.append("bio", bio);

            if (image) {
                formData.append("profileImage", image);
            }

            await api.put("/users/profile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Profile updated!");
        } catch (err) {
            setError(err.response?.data?.message || "Update failed");
        }
    };

    return (
        <MainLayout>
            <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm dark:text-white dark:bg-app-dark">

                <h1 className="text-xl font-bold mb-6">Edit Profile</h1>

                {/* IMAGE */}
                <div className="mb-6 text-center">
                    {preview ? (
                        <img
                            src={preview}
                            className="h-24 w-24 rounded-full mx-auto object-cover"
                        />
                    ) : (
                        <div className="h-24 w-24 mx-auto rounded-full bg-gray-200 flex items-center justify-center">
                            <User size={32} className="text-gray-500" />
                        </div>
                    )}

                    <div className="mt-3 flex flex-col items-center gap-2">
                        <input type="file" onChange={handleImageChange} />

                        {/* REMOVE BUTTON */}
                        {preview && (
                            <button
                                onClick={handleRemoveImage}
                                className="text-sm text-red-500 hover:text-red-600 font-medium"
                            >
                                Remove photo
                            </button>
                        )}
                    </div>
                </div>

                {/* USERNAME */}
                {username.length > 0 && username.length < 3 && (
                    <span className="text-yellow-500 text-sm">
                        Username must be at least 3 characters
                    </span>
                )}
                <div className="mb-4">
                    <label className="block text-sm mb-1">Username</label>
                    <input
                        value={username}
                        onChange={(e) =>
                            setUsername(
                                e.target.value
                                    .toLowerCase()
                                    .replace(/\s/g, "")
                            )
                        }
                        className="w-full border rounded-lg p-2"
                    />

                    {/* 🔥 STATUS */}
                    <div className="text-sm mt-1">
                        {checking && <span className="text-gray-500">Checking...</span>}

                        {!checking && usernameStatus === "available" && (
                            <span className="text-green-500">✅ Username available</span>
                        )}

                        {!checking && usernameStatus === "taken" && (
                            <span className="text-red-500">❌ Username already taken</span>
                        )}
                    </div>
                </div>

                {error && (
                    <p className="text-red-500 text-sm mb-3">{error}</p>
                )}

                {/* BIO */}
                <div className="mb-4">
                    <label className="block text-sm mb-1">Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write something about yourself..."
                        maxLength={150}
                        className="w-full border rounded-lg p-2 resize-none"
                        rows={3}
                    />

                    <div className="text-xs text-slate-500 text-right mt-1">
                        {bio.length}/150
                    </div>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={usernameStatus === "taken"}
                    className="w-full"
                >
                    Save Changes
                </Button>
            </div>
        </MainLayout>
    );
}

export default EditProfile;