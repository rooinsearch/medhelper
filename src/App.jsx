import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import HomePage from "./pages/HomePage.jsx";
import HealthTips from "./pages/HealthTips.jsx";
import CheckAI from "./pages/CheckAI.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ProfileSidebar from './components/ProfileSidebar';
import Footer from "./components/Footer.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import Cart from "./pages/CartPage.jsx";
import MyTestsPage from "./pages/MyTestsPage.jsx";
import ClinicTests from "./pages/ClinicsPage.jsx";
import ClinicDetailPage from "./components/ClinicDetailPage.jsx";
import "./App.css";

const Layout = ({ children }) => {
  const location = useLocation();
  const showFooter = location.pathname !== "/checkai";

  return (
    <>
      {children}
      {showFooter && <Footer />}
    </>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(!!token && authStatus);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Header 
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin} 
        onLogout={handleLogout} 
      />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/health-tips" element={<HealthTips />} />
          <Route path="/checkai" element={<CheckAI />} />
          <Route path="/clinics" element={<ClinicTests/>}/>
          <Route path="/clinics/:id" element={<ClinicDetailPage />} />
          <Route path="/catalog-of-tests" element={<CatalogPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/my-tests" element={<MyTestsPage />} />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? (
                <ProfilePage />
              ) : (
                <Navigate to="/" state={{ from: "profile" }} replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
          <Route 
            path="/catalog-of-tests"
            element={
              isAuthenticated ? (
                <CatalogPage />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;