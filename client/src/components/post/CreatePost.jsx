import { useState } from "react";
import { Image, Smile, MapPin, User } from "lucide-react";
import Button from "../ui/Button";
import api from "../../api/axios";
import { useAuth } from "../../context/useAuth"; // adjust path if needed

function CreatePost({ onPostCreated }) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    // handle image select
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        setImages(files);

        const previewUrls = files.map((file) =>
            URL.createObjectURL(file)
        );

        setPreviews(previewUrls);
    };

    // submit post
    const handleSubmit = async () => {
        if (!content.trim() && images.length === 0) return;

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("content", content);

            // 🔥 MULTIPLE IMAGES
            images.forEach((img) => {
                formData.append("images", img);
            });

            const res = await api.post("/posts", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            // reset
            setContent("");
            setImages([]);
            setPreviews([]);

            // update UI (optional)
            if (onPostCreated) {
                onPostCreated(res.data.post);
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:text-white dark:bg-app-dark">
            <div className="flex gap-3">
                <div className="h-fit shrink-0 rounded-full bg-insta-gradient p-[2px]">
                    {user?.profileImage?.url ? (
                        <img
                            src={user.profileImage.url}
                            alt="Me"
                            className="h-11 w-11 rounded-full border-2 border-white object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white dark:bg-app-dark dark:border-[#282f3c]">
                            <User className="w-5 h-5 text-slate-500 dark:text-white" />
                        </div>
                    )}

                </div>

                <div className="flex-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        rows="3"
                        className="w-full resize-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:placeholder:text-white sm:text-base dark:text-white"
                    />

                    {/* IMAGE PREVIEW */}
                    {previews.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto">
                            {previews.map((src, i) => (
                                <img
                                    key={i}
                                    src={src}
                                    className="h-40 w-40 rounded-xl object-cover"
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 text-slate-500 sm:gap-4">

                            {/* IMAGE UPLOAD */}
                            <label className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-2 transition hover:bg-pink-50 hover:text-insta-pink dark:text-white">
                                <Image size={20} />
                                <span className="hidden text-sm sm:inline">Photo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full px-6 py-2 sm:w-auto"
                        >
                            {loading ? "Posting..." : "Post"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreatePost;