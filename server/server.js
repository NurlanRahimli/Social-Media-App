const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const http = require("http");
const { Server } = require("socket.io");

const Message = require("./models/Message");
const User = require("./models/User");

let onlineUsers = new Set();

const app = express();

// middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json());

// connect to database
connectDB();

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// test route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// CREATE HTTP SERVER
const server = http.createServer(app);

// SOCKET.IO SETUP
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
    },
});

// MAKE IO AVAILABLE IN CONTROLLERS
app.set("io", io);

// SOCKET CONNECTION
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // USER JOINS THEIR ROOM
    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
        onlineUsers.add(userId);

        // broadcast online users
        io.emit("onlineUsers", Array.from(onlineUsers));
    });


    // SEND MESSAGE (REAL-TIME)
    socket.on(
        "sendMessage",
        async ({
            senderId,
            receiverId,
            messageId,
            text,
        }) => {

            console.log("Sending message:", text);

            // get sender info
            const sender = await require("./models/User").findById(senderId);

            // REALTIME CHAT MESSAGE
            io.to(receiverId).emit("receiveMessage", {
                senderId,
                receiverId,
                text,
                messageId,
                createdAt: new Date(),
            });

            // REALTIME MESSAGE DROPDOWN NOTIFICATION
            io.to(receiverId).emit(
                "newMessageNotification",
                {
                    senderId,
                    username: sender.username,
                    profileImage: sender.profileImage?.url,
                    text,
                    createdAt: new Date(),
                }
            );

            // mark delivered
            if (messageId) {

                await Message.findByIdAndUpdate(
                    messageId,
                    {
                        delivered: true,
                    }
                );

                io.to(senderId).emit(
                    "messageDelivered",
                    {
                        messageId,
                    }
                );
            }
        }
    );



    // TYPING
    socket.on("typing", ({ senderId, receiverId }) => {
        socket.to(receiverId).emit("typing", { senderId });
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
        socket.to(receiverId).emit("stopTyping", { senderId });
    });



    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        // remove user
        onlineUsers.forEach((id) => {
            if (socket.rooms.has(id)) {
                onlineUsers.delete(id);
            }
        });

        io.emit("onlineUsers", Array.from(onlineUsers));
    });


});

// START SERVER
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});