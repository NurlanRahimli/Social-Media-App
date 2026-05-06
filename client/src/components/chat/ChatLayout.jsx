import { useParams } from "react-router-dom";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

function ChatLayout() {
    const { userId } = useParams();

    return (
        <div className="h-[calc(100vh)] flex md:p-3 md:gap-3">

            {/* SIDEBAR */}
            <div
                className={`
                    ${userId ? "hidden md:flex" : "flex"}
                    w-full md:w-[320px]
                    bg-white dark:bg-gray-900
                    md:rounded-2xl shadow
                    flex-col
                `}
            >
                <ChatSidebar activeChatId={userId} />
            </div>

            {/* CHAT */}
            <div
                className={`
                    ${userId ? "flex" : "hidden md:flex"}
                    flex-1
                    bg-white dark:bg-gray-900
                    md:rounded-2xl shadow
                    flex-col
                `}
            >
                {userId ? (
                    <ChatWindow selectedUserId={userId} />
                ) : (
                    <div className="flex items-center justify-center w-full text-gray-500 pt-5">
                        Select a chat
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatLayout;