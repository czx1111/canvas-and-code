import { Routes, Route, useNavigate } from "react-router-dom";
import { Suspense, lazy, useState, useCallback } from "react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import RouteScrollToTop from "./components/RouteScrollToTop.jsx";
import SearchModal from "./components/SearchModal.jsx";
import Home from "./pages/Home.jsx";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts.js";
import { useTheme } from "./contexts/ThemeContext.jsx";

// Lazy-load non-critical pages for smaller initial bundle
const Blog = lazy(() => import("./pages/Blog.jsx"));
const PostDetail = lazy(() => import("./pages/PostDetail.jsx"));
const Notes = lazy(() => import("./pages/Notes.jsx"));
const NoteDetail = lazy(() => import("./pages/NoteDetail.jsx"));
const Tags = lazy(() => import("./pages/Tags.jsx"));
const FriendLinks = lazy(() => import("./pages/FriendLinks.jsx"));
const Guestbook = lazy(() => import("./pages/Guestbook.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Archive = lazy(() => import("./pages/Archive.jsx"));
const Projects = lazy(() => import("./pages/Projects.jsx"));
const Changelog = lazy(() => import("./pages/Changelog.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function PageLoader() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const handleNavigate = useCallback((path) => navigate(path), [navigate]);

  useKeyboardShortcuts({
    onOpenSearch: openSearch,
    onToggleTheme: toggleTheme,
    onNavigate: handleNavigate,
  });

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar onSearchOpen={openSearch} />
      <main className="flex-1">
        <ErrorBoundary>
          <RouteScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/post/:slug" element={<PostDetail />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/note/:slug" element={<NoteDetail />} />
              <Route path="/tags" element={<Tags />} />
              <Route path="/links" element={<FriendLinks />} />
              <Route path="/guestbook" element={<Guestbook />} />
              <Route path="/about" element={<About />} />
              <Route path="/archive" element={<Archive />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <ScrollToTop />
      <SearchModal open={searchOpen} onClose={closeSearch} />
    </div>
  );
}
