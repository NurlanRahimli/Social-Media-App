import { useAuth } from "../../context/useAuth";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

function MessageBubble({ msg, onDelete, onEdit }) {
    const { user } = useAuth();
    const [expanded, setExpanded] = useState(false);


    console.log("CURRENT USER:", user);
    console.log("MESSAGE:", msg);


    const isMe =
        msg.sender === user._id ||
        msg.sender?._id === user._id;

    const words = msg.text.split(" ");

    const displayedText = expanded
        ? msg.text
        : words.slice(0, 80).join(" ");

    const shouldShowReadMore = words.length > 80;

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div
            className={`flex group animate-messageIn w-fit max-w-full items-start gap-2
    ${isMe ? "ml-auto" : "mr-auto"}
`}
        >

            {/* ACTIONS */}
            {isMe && (
                <div className="flex items-start opacity-100 md:opacity-0 md:group-hover:opacity-100 transition mt-2 gap-4">

                    <button
                        onClick={() => onEdit(msg)}
                        className="text-gray-400 hover:text-blue-500 cursor-pointer"
                    >
                        <Pencil size={16} />
                    </button>

                    <button
                        onClick={() => onDelete(msg._id)}
                        className="text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                        <Trash2 size={16} />
                    </button>

                </div>
            )}

            {/* MESSAGE */}
            <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>

                <div
                    className={`px-4 py-2 rounded-2xl max-w-[280px] md:max-w-[420px] break-words
                ${isMe
                            ? "bg-insta-gradient text-white"
                            : "bg-white dark:bg-[#282f3c] dark:text-gray-100"
                        }`}
                >
                    {displayedText}

                    {shouldShowReadMore && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="ml-2 text-sm font-medium underline opacity-80 cursor-pointer"
                        >
                            {expanded ? "Read less" : "Read more"}
                        </button>
                    )}

                    {msg.edited && (
                        <span className="text-xs ml-2 opacity-70">
                            edited
                        </span>
                    )}
                </div>

                {/* TIME */}
                <span className="text-xs mt-1 opacity-60 dark:text-gray-100">
                    {formatTime(msg.createdAt)}
                </span>

                {/* SEEN */}
                {isMe && (
                    <div className="text-xs opacity-70">
                        {msg.seen ? "✔✔" : msg.delivered ? "✔" : ""}
                    </div>
                )}

            </div>
        </div>
    );
}

export default MessageBubble;