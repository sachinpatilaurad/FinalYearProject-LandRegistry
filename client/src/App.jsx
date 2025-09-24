import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { WalletProvider } from "./components/WalletContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import LandingPage from "./components/LandingPage.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import ManageLandPage from "./components/ManageLandPage.jsx";
import AboutPage from "./components/AboutPage.jsx";
import FeaturesPage from "./components/FeaturesPage.jsx";
import UserProfile from "./components/UserProfile.jsx";
import UserManagement from "./components/UserManagement.jsx";
import CertificateVerification from "./components/CertificateVerification.jsx";

function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-white dark:bg-dark-primary text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Navbar />
            <main className="flex-1 pt-16">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/manage-land" element={<ManageLandPage />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/users" element={<UserManagement />} />
                <Route
                  path="/verify-certificate"
                  element={<CertificateVerification />}
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;
