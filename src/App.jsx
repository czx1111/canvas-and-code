import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Blog from "./pages/Blog.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import Notes from "./pages/Notes.jsx";
import NoteDetail from "./pages/NoteDetail.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";
export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/note/:slug" element={<NoteDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
