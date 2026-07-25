import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import RouteScrollToTop from "./components/RouteScrollToTop.jsx";
import Home from "./pages/Home.jsx";

// Lazy-load non-critical pages for smaller initial bundle
const Blog = lazy(() => import("./pages/Blog.jsx"));
const PostDetail = lazy(() => import("./pages/PostDetail.jsx"));
const Notes = lazy(() => import("./pages/Notes.jsx"));
const NoteDetail = lazy(() => import("./pages/NoteDetail.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function PageLoader() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
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
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
