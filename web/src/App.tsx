import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StoryDetail from "./pages/StoryDetail";
import ChapterReader from "./pages/ChapterReader";
import WriteStory from "./pages/WriteStory";
import EditChapter from "./pages/EditChapter";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Search from "./pages/Search";
import Library from "./pages/Library";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/story/:id" element={<StoryDetail />} />
          <Route path="/read/:id" element={<ChapterReader />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route
            path="/library"
            element={
              <PrivateRoute>
                <Library />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/write/:id"
            element={
              <PrivateRoute>
                <WriteStory />
              </PrivateRoute>
            }
          />
          <Route
            path="/write/:storyId/chapter/:chapterId"
            element={
              <PrivateRoute>
                <EditChapter />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
