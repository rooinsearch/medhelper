import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import HomePage from './pages/HomePage.jsx';

import HealthTips from './pages/HealthTips.jsx';
import "./App.css";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        <Route path="/" element={<HealthTips />} />
      </Routes>
    </Router>
  );
}

export default App;