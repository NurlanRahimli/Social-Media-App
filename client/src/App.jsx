import { Routes, Route } from "react-router-dom";

import { Toaster } from "react-hot-toast";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/main/Home";
import Profile from "./pages/main/Profile";
import PostDetails from "./pages/PostDetails/PostDetails";
import Settings from "./pages/settings/Settings";
import EditProfile from "./pages/settings/EditProfile";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LikesPage from "./pages/likes/LikesPage";
import SearchPage from "./pages/search/SearchPage";
import UsersPage from "./pages/users/UsersPage";
import ChangePassword from "./pages/settings/ChangePassword";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import EditPost from "./components/post/EditPost"
import ChatPage from "./pages/chat/ChatPage";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* Protected */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/post/:id" element={<ProtectedRoute><PostDetails /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/likes" element={<ProtectedRoute><LikesPage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/chat/:userId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        <Route path="/edit-post/:id" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;