import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import Layout from "./components/layout/Layout.jsx";
import Home from "./pages/Home.jsx";
import Watch from "./pages/Watch.jsx";
import Search from "./pages/Search.jsx";
import History from "./pages/History.jsx";
import Upload from "./pages/upload.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ManageVideos from "./pages/manageVideos.jsx";
import EditVideo from "./pages/editVideo.jsx";
import NotFound from "./pages/NotFound.jsx";
import LoginForm from "./components/auth/LoginForm.jsx";
import RegisterForm from "./components/auth/RegisterForm.jsx";
import PlaylistsPage from "./pages/PlaylistsPage.jsx";
import PlaylistDetailsPage from "./pages/PlaylistDetailsPage.jsx";
import Channel from "./pages/Channel.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Auth routes without layout */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />

              {/* Main app routes with layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="watch/:id" element={<Watch />} />
                <Route path="search" element={<Search />} />
                <Route path="history" element={<History />} />
                <Route path="subscriptions" element={<Subscriptions />} />
                <Route path="channel/:username" element={<Channel />} />
                <Route path="upload" element={<Upload />} />
                <Route path="/dashboard/:username" element={<Dashboard />} />

                <Route path="manage-videos" element={<ManageVideos />} />
                <Route path="your-videos" element={<ManageVideos />} />
                <Route path="edit-video/:id" element={<EditVideo />} />
                <Route path="playlists" element={<PlaylistsPage />} />
                <Route
                  path="playlists/:playlistId"
                  element={<PlaylistDetailsPage />}
                />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>

            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                className: "dark:bg-gray-800 dark:text-white",
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
