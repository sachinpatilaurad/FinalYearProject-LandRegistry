import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { WalletProvider } from './components/WalletContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import AdminPanel from './components/AdminPanel';
import ManageLandPage from './components/ManageLandPage';
import AboutPage from './components/AboutPage'; // Add this
import FeaturesPage from './components/FeaturesPage'; // Add this
import './App.css';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/manage-land" element={<ManageLandPage />} />
              <Route path="/admin" element={<AdminPanel />} />
              {/* Add other static pages if you want */}
              <Route path="/about" element={<AboutPage />} /> {/* Add this */}
              <Route path="/features" element={<FeaturesPage />} /> {/* Add this */}
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;