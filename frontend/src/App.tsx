import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Session from './pages/Session';
import Counsellor from './pages/Counsellor';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Placeholder for other routes */}
        <Route path="/onboard" element={<Onboarding />} />
        <Route path="/session/:id" element={<Session />} />
        <Route path="/counsellor" element={<Counsellor />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
