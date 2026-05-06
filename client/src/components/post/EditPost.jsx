import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Button from "../../components/ui/Button";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import MainLayout from '../layout/MainLayout'

function EditPost() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [content, setContent] = useState("");
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [loading, setLoading] = useState(false);

    // fetch post
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/posts/${id}`);
                const post = res.data.post || res.data;

                setContent(post.content);
                setExistingImages(post.images || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchPost();
    }, [id]);



    const MAX_IMAGES = 5;

    const handleNewImages = (e) => {
        const files = Array.from(e.target.files);

        const currentTotal = existingImages.length + newImages.length;

        const availableSlots = MAX_IMAGES - currentTotal;

        if (availableSlots <= 0) {
            toast.error("You already have maximum images");
            return;
        }

        const filesToAdd = files.slice(0, availableSlots);

        if (files.length > availableSlots) {
            toast.error(`You can only add ${availableSlots} more image(s)`);
        }

        setNewImages((prev) => [...prev, ...filesToAdd]);

        const previews = filesToAdd.map((file) =>
            URL.createObjectURL(file)
        );

        setNewPreviews((prev) => [...prev, ...previews]);

        e.target.value = null;
    };



    // remove existing image
    const removeExistingImage = (publicId) => {
        setExistingImages((prev) =>
            prev.filter((img) => img.publicId !== publicId)
        );
    };

    // remove new image
    const removeNewImage = (index) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
        setNewPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // submit
    const handleUpdate = async () => {
        // ✅ ADD THIS HERE (before anything else)
        if (existingImages.length + newImages.length > MAX_IMAGES) {
            toast.error("You can only upload up to 5 images");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("content", content);

            formData.append(
                "existingImages",
                JSON.stringify(existingImages.map((img) => img.publicId))
            );

            newImages.forEach((img) => {
                formData.append("images", img);
            });

            await api.put(`/posts/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            // ✅ optional success toast
            toast.success("Post updated successfully");

            navigate(`/post/${id}`);
        } catch (err) {
            console.error(err);

            // ✅ optional error toast
            toast.error(err.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto p-4">

                <h1 className="text-xl font-bold mb-4">Edit Post</h1>

                {/* TEXT */}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full border p-3 rounded-lg mb-4"
                />

                {/* EXISTING IMAGES */}
                <div className="flex gap-2 flex-wrap mb-4">
                    {existingImages.map((img) => (
                        <div key={img.publicId} className="relative">
                            <img
                                src={img.url}
                                className="w-24 h-24 object-cover rounded"
                            />
                            <button
                                onClick={() => removeExistingImage(img.publicId)}
                                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* NEW IMAGES */}
                <div className="flex gap-2 flex-wrap mb-4">
                    {newPreviews.map((src, i) => (
                        <div key={i} className="relative">
                            <img
                                src={src}
                                className="w-24 h-24 object-cover rounded"
                            />
                            <button
                                onClick={() => removeNewImage(i)}
                                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* ADD IMAGE */}
                <input type="file" multiple onChange={handleNewImages} />

                <Button onClick={handleUpdate} className="mt-4 w-full">
                    {loading ? "Updating..." : "Update Post"}
                </Button>
            </div>
        </MainLayout>
    );
}

export default EditPost;