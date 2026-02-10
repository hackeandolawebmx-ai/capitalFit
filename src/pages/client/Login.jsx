import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../store';
import { User, Calendar, ArrowRight, Zap, Dumbbell } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        setTimeout(() => {
            const clients = db.getClients();
            const client = clients.find(c => c.phone === phone);

            if (client) {
                if (client.birthDate === dob) {
                    localStorage.setItem('current_client_id', client.id);
                    navigate('/mi-membresia/estatus');
                } else {
                    setError('La fecha de nacimiento no coincide.');
                }
            } else {
                setError('Número no encontrado. Verifica tus datos.');
            }
            setLoading(false);
        }, 800);
    };

    return (
        <div className="login-stitch">
            <div className="login-bg"></div>
            <div className="login-content">
                <div className="brand-header">
                    <div className="logo-icon-large">
                        <Zap size={48} fill="currentColor" />
                    </div>
                    <h1>CAPITAL FIT</h1>
                    <p className="tracking-widest text-xs font-bold text-primary">WELLNESS SUDIO</p>
                </div>

                <div className="glass-card login-card">
                    <div className="card-header">
                        <h2>Acceso a Socios</h2>
                        <p>Ingresa tus datos para gestionar tu membresía</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group-stitch">
                            <label>NÚMERO DE TELÉFONO</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={20} />
                                <input
                                    type="tel"
                                    placeholder="Ej. 55 1234 5678"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group-stitch">
                            <label>FECHA DE NACIMIENTO</label>
                            <div className="input-wrapper">
                                <Calendar className="input-icon" size={20} />
                                <input
                                    type="date"
                                    value={dob}
                                    onChange={e => setDob(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="error-banner">
                                <Dumbbell size={16} /> {error}
                            </div>
                        )}

                        <button type="submit" className="btn-stitch-primary w-full" disabled={loading}>
                            {loading ? 'Verificando...' : (
                                <>Ver mi Estatus <ArrowRight size={20} /></>
                            )}
                        </button>
                    </form>
                </div>

                <p className="copyright">© 2024 Capital Fit. Todos los derechos reservados.</p>
            </div>

            <style>{`
                .login-stitch {
                    min-height: 100vh;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    font-family: 'Outfit', sans-serif;
                }

                .login-bg {
                    position: absolute;
                    inset: 0;
                    background-image: url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop');
                    background-size: cover;
                    background-position: center;
                    filter: brightness(0.3) saturate(0);
                    z-index: 0;
                }
                .login-bg::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, rgba(0,0,0,0.4), var(--color-bg));
                }

                .login-content {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 420px;
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2rem;
                }

                .brand-header {
                    text-align: center;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .logo-icon-large {
                    color: var(--color-primary);
                    margin-bottom: 1rem;
                    filter: drop-shadow(0 0 15px rgba(249, 115, 22, 0.4));
                }
                .brand-header h1 {
                    font-size: 2.5rem;
                    font-weight: 900;
                    line-height: 1;
                    letter-spacing: -0.02em;
                    margin: 0;
                    font-style: italic;
                }

                .login-card {
                    width: 100%;
                    padding: 2.5rem;
                    backdrop-filter: blur(20px);
                    background: rgba(20, 20, 20, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }

                .card-header { text-align: center; margin-bottom: 2rem; }
                .card-header h2 { font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.5rem; }
                .card-header p { font-size: 0.9rem; color: var(--color-text-muted); }

                .form-group-stitch { margin-bottom: 1.5rem; }
                .form-group-stitch label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: var(--color-text-muted);
                    margin-bottom: 0.75rem;
                    letter-spacing: 0.05em;
                }
                .input-wrapper { position: relative; }
                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--color-text-muted);
                    transition: color 0.3s;
                }
                .input-wrapper input {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid var(--color-border);
                    border-radius: 12px;
                    padding: 1rem 1rem 1rem 3rem;
                    color: white;
                    font-weight: 500;
                    transition: all 0.3s;
                    font-family: 'Outfit', sans-serif;
                }
                .input-wrapper input:focus {
                    background: rgba(0, 0, 0, 0.5);
                    border-color: var(--color-primary);
                    outline: none;
                    box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
                }
                .input-wrapper input:focus + .input-icon { color: var(--color-primary); }

                .btn-stitch-primary {
                    background: var(--color-primary);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    transition: all 0.3s;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-size: 0.9rem;
                }
                .btn-stitch-primary:hover {
                    background: #ea580c; /* darker orange */
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px -5px rgba(249, 115, 22, 0.3);
                }
                .btn-stitch-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                .error-banner {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    padding: 0.75rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .copyright {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.3);
                    margin-top: 1rem;
                }
            `}</style>
        </div>
    );
};

export default Login;
