import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// import AppTest from './App.test'; // Uncomment to test if React is working
import "./styles/globals.css";

// Apply default CSS variables immediately to prevent FOUC
const applyDefaultBrandingVariables = () => {
  const root = document.documentElement;

  console.log("🎨 Applying default branding variables...");

  // Default light mode colors
  root.style.setProperty("--backgroundColor", "#f9fafb");
  root.style.setProperty("--middleBackgroundColor", "#ffffff");
  root.style.setProperty("--primaryColor", "#7c3aed");
  root.style.setProperty("--primaryTextColor", "#111827");
  root.style.setProperty("--secondaryColor", "#a78bfa");
  root.style.setProperty("--secondaryTextColor", "#374151");
  root.style.setProperty("--primaryColorBtn", "#7c3aed");
  root.style.setProperty("--primaryHoverColorBtn", "#6d28d9");
  root.style.setProperty("--primaryTextColorBtn", "#ffffff");
  root.style.setProperty("--dangerColorBtn", "#ef4444");
  root.style.setProperty("--dangerTextColorBtn", "#ffffff");
  root.style.setProperty(
    "--primaryColorBtnRgb",
    "124, 58, 237",
  );
  root.style.setProperty("--dangerColorBtnRgb", "239, 68, 68");
  root.style.setProperty("--bgColorSideMenu", "#ffffff");
  root.style.setProperty("--primaryColorSideMenu", "#374151");
  root.style.setProperty("--selectedColorSideMenu", "#ffffff");
  root.style.setProperty(
    "--selectedBgColorSideMenu",
    "linear-gradient(to bottom right, #7c3aed, #6d28d9)",
  );
  root.style.setProperty("--bgColorTopBar", "#ffffff");
  root.style.setProperty("--primaryColorTopBar", "#111827");
  root.style.setProperty("--iconsColorTopBar", "#6b7280");
  root.style.setProperty("--iconDefaultColor", "#6b7280");
  root.style.setProperty("--iconActiveColor", "#7c3aed");
  root.style.setProperty("--stokeColor", "#e5e7eb");
  root.style.setProperty("--pageBgColorLogin", "#f9fafb");
  root.style.setProperty(
    "--imageBgColorLogin",
    "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
  );

  console.log("✅ Default branding variables applied");
};

// Apply variables before app renders
applyDefaultBrandingVariables();

console.log("🚀 Starting Acounta application...");
if (typeof import.meta !== "undefined" && import.meta.env) {
  console.log("📦 Environment:", import.meta.env.MODE);
  console.log("🌐 Base URL:", import.meta.env.BASE_URL);
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ Root element not found!");
  throw new Error("Failed to find the root element");
}

console.log("✅ Root element found, rendering app...");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);