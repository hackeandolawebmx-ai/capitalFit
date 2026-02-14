import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../store';
import { ArrowLeft, Save, Plus, Activity, Calendar, TrendingUp, User, Ruler } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const Profile = () => {
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [biometrics, setBiometrics] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        weight: '',
        height: '',
        bodyFat: '',
        muscleMass: '',
        visceralFat: '',
        metabolicAge: '',
        waist: '',
        hip: '',
        chest: '',
        armRight: '',
        armLeft: '',
        thighRight: '',
        thighLeft: '',
        calfRight: '',
        calfLeft: ''
    });

    useEffect(() => {
        const id = localStorage.getItem('current_client_id');
        if (!id) {
            navigate('/mi-membresia');
            return;
        }

        const clients = db.getClients();
        const found = clients.find(c => c.id === id || c.id === parseInt(id));

        if (found) {
            setClient(found);
            const bio = db.getBiometrics ? db.getBiometrics(found.id) : [];
            setBiometrics(bio);

            // Pre-fill height if available in latest biometric or keep empty
            if (bio.length > 0) {
                setFormData(prev => ({ ...prev, height: bio[0].height || '' }));
            }
        } else {
            navigate('/mi-membresia');
        }
    }, [navigate, showForm]); // Re-fetch on form close to update list

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (client) {
            // Convert strings to numbers where appropriate
            const dataToSave = Object.fromEntries(
                Object.entries(formData).map(([key, val]) => [key, val ? parseFloat(val) : null])
            );

            db.addBiometric(client.id, dataToSave);
            setShowForm(false);
            // Dictionary reset or keep height?
            setFormData(prev => ({
                weight: '',
                height: prev.height, // Keep height
                bodyFat: '',
                muscleMass: '',
                visceralFat: '',
                metabolicAge: '',
                waist: '',
                hip: '',
                chest: '',
                armRight: '',
                armLeft: '',
                thighRight: '',
                thighLeft: '',
                calfRight: '',
                calfLeft: ''
            }));
        }
    };

    if (!client) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Cargando...</div>;

    const latest = biometrics.length > 0 ? biometrics[0] : null;

    return (
        <div className="profile-stitch">
            <nav className="top-nav">
                <button className="back-btn" onClick={() => navigate('/mi-membresia/estatus')}>
                    <ArrowLeft size={20} />
                </button>
                <h1>Mi Progreso</h1>
                <div className="w-10"></div> {/* Spacer for centering */}
            </nav>

            <main className="main-content">
                {/* Header Summary */}
                <div className="user-header">
                    <div className="avatar-large">
                        <User size={32} />
                    </div>
                    <div>
                        <h2>{client.name}</h2>
                        <p className="text-muted text-sm">Miembro desde {client.joinDate ? format(parseISO(client.joinDate), 'yyyy') : '2024'}</p>
                    </div>
                </div>

                {/* Latest Stats Cards */}
                {latest ? (
                    <div className="stats-grid">
                        <div className="stat-card primary">
                            <div className="icon"><Activity size={16} /></div>
                            <div className="value">{latest.weight} <span className="unit">kg</span></div>
                            <div className="label">Peso Actual</div>
                        </div>
                        <div className="stat-card">
                            <div className="icon"><TrendingUp size={16} /></div>
                            <div className="value">{latest.bodyFat || '--'} <span className="unit">%</span></div>
                            <div className="label">Grasa Corporal</div>
                        </div>
                        <div className="stat-card">
                            <div className="icon"><User size={16} /></div>
                            <div className="value">{latest.muscleMass || '--'} <span className="unit">%</span></div>
                            <div className="label">Masa Muscular</div>
                        </div>
                        <div className="stat-card">
                            <div className="icon"><Activity size={16} /></div>
                            <div className="value">{latest.metabolicAge || '--'} <span className="unit">años</span></div>
                            <div className="label">Edad Metabólica</div>
                        </div>
                    </div>
                ) : (
                    <div className="empty-stats">
                        <p>Aún no has registrado datos físicos.</p>
                        <button className="btn-stitch-primary mt-2" onClick={() => setShowForm(true)}>Comenzar ahora</button>
                    </div>
                )}

                {/* Main Action */}
                {!showForm && latest && (
                    <button className="add-record-btn" onClick={() => setShowForm(true)}>
                        <Plus size={20} /> Registrar Nuevo Progreso
                    </button>
                )}

                {/* Form Modal/Section */}
                {showForm && (
                    <div className="form-section">
                        <div className="form-header">
                            <h3>Nuevo Registro</h3>
                            <button className="text-sm text-red-400" onClick={() => setShowForm(false)}>Cancelar</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <h4 className="section-title">Datos Básicos</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Peso (kg)</label>
                                    <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleInputChange} required placeholder="0.0" />
                                </div>
                                <div className="form-group">
                                    <label>Altura (cm)</label>
                                    <input type="number" step="1" name="height" value={formData.height} onChange={handleInputChange} required placeholder="0" />
                                </div>
                            </div>

                            <h4 className="section-title">Composición Corporal</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>% Grasa</label>
                                    <input type="number" step="0.1" name="bodyFat" value={formData.bodyFat} onChange={handleInputChange} placeholder="%" />
                                </div>
                                <div className="form-group">
                                    <label>% Músculo</label>
                                    <input type="number" step="0.1" name="muscleMass" value={formData.muscleMass} onChange={handleInputChange} placeholder="%" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Grasa Visceral</label>
                                    <input type="number" step="1" name="visceralFat" value={formData.visceralFat} onChange={handleInputChange} placeholder="Nivel" />
                                </div>
                                <div className="form-group">
                                    <label>Edad Metabólica</label>
                                    <input type="number" step="1" name="metabolicAge" value={formData.metabolicAge} onChange={handleInputChange} placeholder="Años" />
                                </div>
                            </div>

                            <h4 className="section-title">Medidas (cm)</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Cintura</label>
                                    <input type="number" step="0.5" name="waist" value={formData.waist} onChange={handleInputChange} placeholder="cm" />
                                </div>
                                <div className="form-group">
                                    <label>Cadera</label>
                                    <input type="number" step="0.5" name="hip" value={formData.hip} onChange={handleInputChange} placeholder="cm" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Pecho</label>
                                    <input type="number" step="0.5" name="chest" value={formData.chest} onChange={handleInputChange} placeholder="cm" />
                                </div>
                            </div>
                            <h4 className="section-subtitle">Extremidades (Der / Izq)</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Brazo</label>
                                    <div className="flex gap-2">
                                        <input type="number" step="0.5" name="armRight" value={formData.armRight} onChange={handleInputChange} placeholder="R" />
                                        <input type="number" step="0.5" name="armLeft" value={formData.armLeft} onChange={handleInputChange} placeholder="L" />
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Muslo</label>
                                    <div className="flex gap-2">
                                        <input type="number" step="0.5" name="thighRight" value={formData.thighRight} onChange={handleInputChange} placeholder="R" />
                                        <input type="number" step="0.5" name="thighLeft" value={formData.thighLeft} onChange={handleInputChange} placeholder="L" />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="save-btn">
                                <Save size={18} /> Guardar Registro
                            </button>
                        </form>
                    </div>
                )}

                {/* History List */}
                <div className="history-section">
                    <h3>Historial</h3>
                    <div className="history-list">
                        {biometrics.map((item) => (
                            <div key={item.id} className="history-item">
                                <div className="history-date">
                                    <Calendar size={14} className="text-primary" />
                                    <span>{format(parseISO(item.date), 'dd MMM yyyy', { locale: es })}</span>
                                </div>
                                <div className="history-summary">
                                    <span className="badge">{item.weight} kg</span>
                                    {item.bodyFat && <span className="badge secondary">{item.bodyFat}% grasa</span>}
                                </div>
                            </div>
                        ))}
                        {biometrics.length === 0 && !showForm && (
                            <div className="text-center p-4 text-muted text-sm italic">No hay historial disponible</div>
                        )}
                    </div>
                </div>
            </main>

            <style>{`
                .profile-stitch {
                    min-height: 100vh;
                    background: #000;
                    color: white;
                    font-family: 'Outfit', sans-serif;
                    padding-bottom: 2rem;
                }
                .top-nav {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 1.5rem; position: sticky; top: 0; background: rgba(0,0,0,0.9);
                    z-index: 10; backdrop-filter: blur(10px);
                }
                .back-btn {
                    width: 40px; height: 40px; border-radius: 50%;
                    background: rgba(255,255,255,0.1); border: none; color: white;
                    display: flex; align-items: center; justify-content: center;
                }
                .top-nav h1 { font-size: 1.2rem; font-weight: 700; margin: 0; }
                
                .main-content { padding: 0 1.5rem; }

                .user-header {
                    display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;
                    padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .avatar-large {
                    width: 60px; height: 60px; border-radius: 50%;
                    background: linear-gradient(135deg, var(--color-primary), #9a3412);
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 8px 20px -5px rgba(249, 115, 22, 0.5);
                }
                .user-header h2 { margin: 0; font-size: 1.5rem; font-weight: 800; line-height: 1.2; }

                .stats-grid {
                    display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem;
                }
                .stat-card {
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px; padding: 1rem;
                    display: flex; flex-direction: column; gap: 0.25rem;
                }
                .stat-card.primary {
                    background: linear-gradient(145deg, rgba(249, 115, 22, 0.2), rgba(0,0,0,0));
                    border-color: rgba(249, 115, 22, 0.3);
                }
                .stat-card .icon { 
                    width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.1);
                    display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem;
                    color: rgba(255,255,255,0.7);
                }
                .stat-card.primary .icon { background: var(--color-primary); color: white; }
                .stat-card .value { font-size: 1.5rem; font-weight: 800; line-height: 1; }
                .stat-card .unit { font-size: 0.8rem; font-weight: 600; opacity: 0.6; }
                .stat-card .label { font-size: 0.7rem; color: rgba(255,255,255,0.5); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

                .empty-stats {
                    text-align: center; padding: 2rem; background: rgba(255,255,255,0.02);
                    border-radius: 16px; margin-bottom: 2rem; border: 1px dashed rgba(255,255,255,0.1);
                }
                .btn-stitch-primary {
                    background: var(--color-primary); color: white; border: none; padding: 0.75rem 1.5rem;
                    border-radius: 12px; font-weight: 700; font-size: 0.9rem;
                }

                .add-record-btn {
                    width: 100%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                    color: white; padding: 1rem; border-radius: 16px;
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                    font-weight: 700; margin-bottom: 2rem; transition: all 0.2s;
                }
                .add-record-btn:active { transform: scale(0.98); background: rgba(255,255,255,0.15); }

                .form-section {
                    background: #111; border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;
                    animation: slideUp 0.3s ease-out;
                }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .form-header h3 { margin: 0; font-size: 1.2rem; font-weight: 700; }
                
                .section-title { font-size: 0.9rem; color: var(--color-primary); margin: 1.5rem 0 1rem 0; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; }
                .section-title:first-of-type { margin-top: 0; }
                .section-subtitle { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin: 1rem 0 0.5rem 0; font-weight: 600; }

                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
                .form-group label { display: block; font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-bottom: 0.4rem; font-weight: 600; }
                .form-group input {
                    width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    color: white; padding: 0.8rem; border-radius: 10px; font-size: 1rem; font-weight: 600;
                }
                .form-group input:focus { outline: none; border-color: var(--color-primary); background: rgba(255,255,255,0.08); }
                .form-group input::placeholder { color: rgba(255,255,255,0.2); }

                .save-btn {
                    width: 100%; background: var(--color-primary); color: white; border: none;
                    padding: 1rem; border-radius: 12px; font-weight: 800; font-size: 1rem;
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                    margin-top: 2rem; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
                }

                .history-list { display: flex; flex-direction: column; gap: 0.75rem; }
                .history-item {
                    display: flex; justify-content: space-between; align-items: center;
                    background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .history-date { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 600; }
                .history-summary { display: flex; gap: 0.5rem; }
                .badge { 
                    background: rgba(255,255,255,0.1); padding: 0.25rem 0.75rem; 
                    border-radius: 20px; font-size: 0.8rem; font-weight: 700; 
                }
                .badge.secondary { background: rgba(249, 115, 22, 0.15); color: #fdba74; }
            `}</style>
        </div>
    );
};

export default Profile;
