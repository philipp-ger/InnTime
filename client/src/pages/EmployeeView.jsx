import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import { format, parseISO, isSameMonth, subMonths, addMonths } from 'date-fns';
import { de } from 'date-fns/locale';

// Auth-Helper: fetch mit Mitarbeiter-Token
function employeeFetch(url, options = {}) {
    const token = localStorage.getItem('employee_token');
    return fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            'Authorization': `Bearer ${token}`
        }
    });
}

const EmployeeView = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [activeTab, setActiveTab] = useState('today');
    const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
    const [timeEntries, setTimeEntries] = useState([]);
    const [currentTime, setCurrentTime] = useState({ start_time: '', end_time: '' });
    const [message, setMessage] = useState(null);
    const [history, setHistory] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Load employees
    useEffect(() => {
        fetch('/api/employees')
            .then(res => res.json())
            .then(data => {
                setEmployees(data || []);
            });
    }, []);

    // Load entries when employee or date changes
    const loadEntries = () => {
        if (!selectedEmployee || !workDate) return;

        fetch(`/api/timesheet?employee_id=${selectedEmployee.id}&date=${workDate}`)
            .then(res => res.json())
            .then(data => {
                setTimeEntries(Array.isArray(data) ? data : []);
            });
    };

    useEffect(() => {
        loadEntries();
    }, [selectedEmployee, workDate]);

    // Load history
    const loadHistory = () => {
        if (!selectedEmployee) return;
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;

        employeeFetch(`/api/employee/${selectedEmployee.id}/history/${year}/${month}`)
            .then(res => {
                if (res.status === 401) {
                    localStorage.removeItem('employee_token');
                    navigate('/time');
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (!data) return;
                const entries = Object.entries(data.days).map(([date, info]) => ({
                    date,
                    ...info
                })).sort((a, b) => b.date.localeCompare(a.date));
                setHistory(entries);
            })
            .catch(() => setHistory([]));
    };

    useEffect(() => {
        loadHistory();
    }, [selectedEmployee, currentMonth]);

    const handleSave = async () => {
        if (!selectedEmployee) return showMessage('Bitte Mitarbeiter wählen', 'error');
        if (!currentTime.start_time || !currentTime.end_time) return showMessage('Bitte Start- und Endzeit eingeben', 'error');

        try {
            const res = await employeeFetch('/api/timesheets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_id: selectedEmployee.id,
                    date: workDate,
                    start_time: currentTime.start_time,
                    end_time: currentTime.end_time
                })
            });
            if (res.status === 401) {
                localStorage.removeItem('employee_token');
                navigate('/time');
                return;
            }
            const data = await res.json();
            if (data.success) {
                showMessage('✅ Gespeichert!', 'success');
                setCurrentTime({ start_time: '', end_time: '' }); // Reset for next interval
                loadEntries();
                loadHistory();
            } else {
                showMessage('Fehler: ' + data.error, 'error');
            }
        } catch (err) {
            showMessage('Netzwerkfehler', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Diesen Eintrag wirklich löschen?')) return;

        try {
            const res = await employeeFetch(`/api/timesheets/${id}`, { method: 'DELETE' });
            if (res.status === 401) {
                localStorage.removeItem('employee_token');
                navigate('/time');
                return;
            }
            const data = await res.json();
            if (data.success) {
                showMessage('🗑️ Gelöscht', 'success');
                loadEntries();
                loadHistory();
            }
        } catch (err) {
            showMessage('Netzwerkfehler', 'error');
        }
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const setNow = (field) => {
        const now = new Date();
        const time = format(now, 'HH:mm');
        setCurrentTime(prev => ({ ...prev, [field]: time }));
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '24px',
                textAlign: 'center',
                borderBottomLeftRadius: '20px',
                borderBottomRightRadius: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                position: 'relative'
            }}>
                <button
                    onClick={() => { localStorage.removeItem('employee_token'); navigate('/time'); }}
                    style={{
                        position: 'absolute', top: '12px', right: '16px',
                        background: 'rgba(255,255,255,0.2)', border: 'none',
                        color: 'white', borderRadius: '8px', padding: '6px 12px',
                        fontSize: '12px', cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏱️</div>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>InnTime</h1>
                <div style={{ opacity: 0.8, fontSize: '13px' }}>Heldenbergen</div>
            </div>

            {/* Notification */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'fixed',
                            top: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: message.type === 'success' ? '#48bb78' : '#f56565',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '50px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            zIndex: 100,
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}
                    >
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ padding: '20px', flex: 1 }}>

                {/* Employee Selector */}
                <Card style={{ marginBottom: '20px', padding: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#718096', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Mitarbeiter
                    </label>
                    <select
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px' }}
                        onChange={(e) => {
                            const emp = employees.find(em => em.id === e.target.value);
                            setSelectedEmployee(emp);
                        }}
                        value={selectedEmployee?.id || ''}
                    >
                        <option value="">-- Bitte wählen --</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>
                </Card>

                {selectedEmployee && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Tabs */}
                        <div style={{ display: 'flex', background: 'white', borderRadius: '12px', padding: '4px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <button
                                onClick={() => setActiveTab('today')}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '8px',
                                    background: activeTab === 'today' ? '#667eea' : 'transparent',
                                    color: activeTab === 'today' ? 'white' : '#718096',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                            >
                                📝 Heute
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '8px',
                                    background: activeTab === 'history' ? '#667eea' : 'transparent',
                                    color: activeTab === 'history' ? 'white' : '#718096',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                            >
                                📋 Verlauf
                            </button>
                        </div>

                        {/* Content */}
                        {activeTab === 'today' ? (
                            <motion.div
                                key="today"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card>
                                    <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#2d3748' }}>
                                        {format(parseISO(workDate), 'EEEE, d. MMMM', { locale: de })}
                                    </h2>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#718096', marginBottom: '8px' }}>DATUM</label>
                                        <input
                                            type="date"
                                            value={workDate}
                                            onChange={(e) => setWorkDate(e.target.value)}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#718096', marginBottom: '8px' }}>START</label>
                                            <input
                                                type="time"
                                                value={currentTime.start_time}
                                                onChange={(e) => setCurrentTime({ ...currentTime, start_time: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '18px', textAlign: 'center' }}
                                            />
                                            <Button variant="success" onClick={() => setNow('start_time')} style={{ width: '100%', marginTop: '8px', fontSize: '12px', padding: '8px' }}>
                                                Jetzt
                                            </Button>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#718096', marginBottom: '8px' }}>ENDE</label>
                                            <input
                                                type="time"
                                                value={currentTime.end_time}
                                                onChange={(e) => setCurrentTime({ ...currentTime, end_time: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '18px', textAlign: 'center' }}
                                            />
                                            <Button variant="danger" onClick={() => setNow('end_time')} style={{ width: '100%', marginTop: '8px', fontSize: '12px', padding: '8px' }}>
                                                Jetzt
                                            </Button>
                                        </div>
                                    </div>

                                    <Button onClick={handleSave} style={{ width: '100%', padding: '16px', fontSize: '16px', marginBottom: '30px' }}>
                                        ➕ Intervall hinzufügen
                                    </Button>

                                    {timeEntries.length > 0 && (
                                        <div style={{ borderTop: '2px dashed #edf2f7', paddingTop: '20px' }}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#718096', marginBottom: '12px', textTransform: 'uppercase' }}>
                                                Gespeicherte Intervalle für heute
                                            </label>
                                            <div style={{ display: 'grid', gap: '10px' }}>
                                                {timeEntries.map((entry) => (
                                                    <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f7fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                        <div style={{ fontWeight: 'bold', color: '#2d3748', fontSize: '18px' }}>
                                                            {entry.start_time} - {entry.end_time}
                                                        </div>
                                                        <button
                                                            onClick={() => handleDelete(entry.id)}
                                                            style={{ background: '#fff5f5', color: '#f56565', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                            title="Löschen"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px' }}>
                                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>◀️</button>
                                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{format(currentMonth, 'MMMM yyyy', { locale: de })}</span>
                                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>▶️</button>
                                </div>

                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {history.length > 0 ? (
                                        history.map((entry) => (
                                            <Card key={entry.date}
                                                style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                                onClick={() => {
                                                    setWorkDate(entry.date);
                                                    setActiveTab('today');
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 'bold', color: '#2d3748' }}>
                                                        {format(parseISO(entry.date), 'dd.MM.', { locale: de })} <span style={{ fontWeight: 'normal', color: '#718096', fontSize: '14px' }}>{format(parseISO(entry.date), 'EEEE', { locale: de })}</span>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#667eea' }}>{(entry.hours || 0).toFixed(2)} h</div>
                                                    <div style={{ fontSize: '12px', color: '#cbd5e0' }}>{entry.start_time} - {entry.end_time}</div>
                                                </div>
                                            </Card>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>Keine Einträge</div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default EmployeeView;
