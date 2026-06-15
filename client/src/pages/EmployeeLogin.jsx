import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const EmployeeLogin = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();

            if (data.success && data.token) {
                localStorage.setItem('employee_token', data.token);
                navigate('/time/dashboard');
            } else {
                setError('Falsches Passwort');
            }
        } catch (err) {
            setError('Verbindungsfehler');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e2e8f0 100%)'
        }}>
            <Card style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏱️</div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748' }}>InnTime</h1>
                    <p style={{ color: '#718096' }}>Fit-Inn Heldenbergen – Mitarbeiterbereich</p>
                </div>

                <form onSubmit={handleLogin}>
                    <Input
                        type="password"
                        label="Passwort"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoFocus
                    />

                    {error && (
                        <div style={{
                            padding: '12px',
                            background: '#fff5f5',
                            color: '#fc8181',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            fontSize: '14px',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <Button type="submit" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Anmelden...' : 'Anmelden'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default EmployeeLogin;
