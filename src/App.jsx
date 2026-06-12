import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './supabase/config';

import Dashboard from './pages/Dashboard';
import MeetingRoom from './pages/MeetingRoom';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!session ? <Register /> : <Navigate to="/" />} />
          
          {/* Protected Routes */}
          <Route path="/" element={session ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/meeting/:roomId" element={session ? <MeetingRoom /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}