import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import { I18nProvider } from "./contexts/I18nContext.jsx";
import { BlogDataProvider } from "./contexts/BlogDataContext.jsx";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <I18nProvider>
        <BlogDataProvider>
          <App />
        </BlogDataProvider>
      </I18nProvider>
    </HashRouter>
  </React.StrictMode>
);
