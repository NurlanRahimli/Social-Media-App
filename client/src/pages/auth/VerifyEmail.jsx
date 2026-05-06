import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Swal from "sweetalert2";

function VerifyEmail() {
    const { token } = useParams();
    const navigate = useNavigate();
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const verify = async () => {
            try {
                const res = await api.get(`/auth/verify-email/${token}`);

                await Swal.fire(
                    "Success",
                    res.data.message,
                    "success"
                );

                navigate("/");

            } catch (err) {
                Swal.fire(
                    "Error",
                    err.response?.data?.message || "Invalid or expired link",
                    "error"
                );
            }
        };

        verify();
    }, [token]);

    return null;
}

export default VerifyEmail;