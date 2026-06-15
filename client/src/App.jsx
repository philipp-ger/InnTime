import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import EmployeeLogin from './pages/EmployeeLogin'
import EmployeeView from './pages/EmployeeView'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'

// ── Auth-Hilfsfunktionen ──────────────────────────────────────────────────────

function isTokenValid(token) {
    if (!token) return false;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload.exp && payload.exp > Math.floor(Date.now() / 1000);
    } catch {
        return false;
    }
}

// ── Geschützte Routen ─────────────────────────────────────────────────────────

const ProtectedAdmin = ({ children }) => {
    const token = localStorage.getItem('admin_token');
    return isTokenValid(token) ? children : <Navigate to="/admin" replace />;
};

const ProtectedEmployee = ({ children }) => {
    const token = localStorage.getItem('employee_token');
    return isTokenValid(token) ? children : <Navigate to="/time" replace />;
};

// ── Startseite ────────────────────────────────────────────────────────────────

const Home = () => (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1>InnTime</h1>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
            <a href="/time" style={{ padding: '15px 30px', background: '#667eea', color: 'white', borderRadius: '10px', textDecoration: 'none' }}>
                Mitarbeiter-Login
            </a>
            <a href="/admin" style={{ padding: '15px 30px', background: '#e2e8f0', color: '#333', borderRadius: '10px', textDecoration: 'none' }}>
                Admin-Login
            </a>
        </div>
    </div>
)

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />

                {/* Mitarbeiterbereich */}
                <Route path="/time" element={<EmployeeLogin />} />
                <Route path="/time/dashboard" element={
                    <ProtectedEmployee><EmployeeView /></ProtectedEmployee>
                } />
                {/* Legacy UUID-Links leiten auf Login um */}
                <Route path="/time/:uuid" element={<Navigate to="/time" replace />} />

                {/* Adminbereich */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={
                    <ProtectedAdmin><AdminDashboard /></ProtectedAdmin>
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default App
