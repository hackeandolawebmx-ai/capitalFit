import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../store';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Zap, QrCode, Calendar, ChevronRight, User, LogOut, Bell, Trophy, TrendingUp, Share2 } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import RenewalModal from './RenewalModal';

const Status = () => {
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [status, setStatus] = useState('loading');
    const [plan, setPlan] = useState(null);
    const [showRenewal, setShowRenewal] = useState(false);

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
            const s = db.getClientStatus ? db.getClientStatus(found) : 'active';
            setStatus(s);

            const plans = db.getPlans();
            const p = plans.find(pl => pl.id === found.activePlanId);
            setPlan(p);
        } else {
            navigate('/mi-membresia');
        }
    }, [navigate]);

    if (!client) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Cargando...</div>;

    const daysRemaining = client.expirationDate ? differenceInDays(parseISO(client.expirationDate), new Date()) : 0;
    const progress = Math.max(0, Math.min(100, (daysRemaining / 30) * 100)); // Assuming 30 day cycle for visual

    return (
        <div className="status-stitch">
            {/* Top Navigation */}
            <nav className="top-nav">
                <div className="brand">
                    <Zap size={20} className="text-primary" fill="currentColor" />
                    <span className="font-bold tracking-tight">CAPITAL FIT</span>
                </div>
                <div className="user-profile">
                    <button className="relative p-2 text-white/60 hover:text-white transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <div className="user-info">
                        <span className="text-xs text-muted text-right block">Bienvenido,</span>
                        <span className="text-sm font-bold block">{client.name.split(' ')[0]}</span>
                    </div>
                    <div className="avatar">
                        <User size={18} />
                    </div>
                </div>
            </nav>

            <main className="main-content">
                {/* Status Card */}
                <div className={`status-card-large ${status}`}>
                    <div className="status-header">
                        <div>
                            <span className="status-label">ESTADO DE MEMBRESÍA</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`status-badge ${status}`}>
                                    {status === 'active' ? 'ACTIVO' : status === 'risk' ? 'POR VENCER' : 'VENCIDO'}
                                </span>
                                {status === 'active' && (
                                    <span className="flex items-center gap-1 text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full font-bold border border-yellow-500/20">
                                        <Trophy size={10} /> ELITE MEMBER
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="status-circle-container">
                        <div className="status-circle">
                            <svg className="progress-ring" width="160" height="160">
                                <circle className="progress-ring__circle-bg" stroke="currentColor" strokeWidth="8" fill="transparent" r="70" cx="80" cy="80" />
                                <circle
                                    className="progress-ring__circle"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    r="70"
                                    cx="80"
                                    cy="80"
                                    style={{ strokeDasharray: `${2 * Math.PI * 70}`, strokeDashoffset: `${2 * Math.PI * 70 * (1 - progress / 100)}` }}
                                />
                            </svg>
                            <div className="circle-content">
                                <span className="days-num">{daysRemaining > 0 ? daysRemaining : 0}</span>
                                <span className="days-label">DÍAS RESTANTES</span>
                            </div>
                        </div>
                    </div>

                    <div className="plan-details">
                        <div className="detail-item">
                            <span className="label">PLAN ACTUAL</span>
                            <span className="value">{plan?.name || '---'}</span>
                        </div>
                        <div className="detail-item right">
                            <span className="label">VENCIMIENTO</span>
                            <span className="value">{client.expirationDate ? format(parseISO(client.expirationDate), 'dd MMM yyyy', { locale: es }) : '---'}</span>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid (MVP Mock) */}
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="icon"><Calendar size={20} className="text-primary" /></div>
                        <div className="data">
                            <span className="value">12</span>
                            <span className="label">Racha Días</span>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="icon"><TrendingUp size={20} className="text-blue-400" /></div>
                        <div className="data">
                            <span className="value">8</span>
                            <span className="label">Visitas Mes</span>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="icon"><User size={20} className="text-purple-400" /></div>
                        <div className="data">
                            <span className="value">78kg</span>
                            <span className="label">Peso Actual</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="actions-grid">
                    <button className="action-card primary" onClick={() => setShowRenewal(true)}>
                        <div className="icon-box">
                            <RefreshCw size={24} />
                        </div>
                        <div className="text-left">
                            <h3>Renovar Plan</h3>
                            <p>Extiende tu acceso</p>
                        </div>
                        <ChevronRight className="ml-auto opacity-50" />
                    </button>

                    <button className="action-card secondary">
                        <div className="icon-box">
                            <QrCode size={24} />
                        </div>
                        <div className="text-left">
                            <h3>Acceso QR</h3>
                            <p>Entrada al gimnasio</p>
                        </div>
                    </button>

                    <button className="action-card referral-card">
                        <div className="icon-box">
                            <Share2 size={24} />
                        </div>
                        <div className="text-left flex-1">
                            <h3>Invita a un amigo</h3>
                            <p>¡Entrenen juntos!</p>
                        </div>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">COPIAR LINK</span>
                    </button>
                </div>

                <button className="logout-btn" onClick={() => {
                    localStorage.removeItem('current_client_id');
                    navigate('/mi-membresia');
                }}>
                    <LogOut size={16} /> Cerrar Sesión
                </button>
            </main>

            {showRenewal && <RenewalModal client={client} onClose={() => setShowRenewal(false)} />}

            <style>{`
                .status-stitch {
                    min-height: 100vh;
                    background: #000;
                    color: white;
                    font-family: 'Outfit', sans-serif;
                    display: flex;
                    flex-direction: column;
                }

                .top-nav {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                }
                .brand { display: flex; align-items: center; gap: 0.5rem; }
                .user-profile { display: flex; align-items: center; gap: 1rem; }
                .avatar {
                    width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1);
                    display: flex; align-items: center; justify-content: center; color: var(--color-primary);
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .main-content { padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 2rem; }

                .status-card-large {
                    background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 24px;
                    padding: 2rem;
                    position: relative;
                    overflow: hidden;
                }
                .status-card-large.active { border-color: rgba(16, 185, 129, 0.3); box-shadow: 0 0 30px rgba(16, 185, 129, 0.1); }
                .status-card-large.risk { border-color: rgba(245, 158, 11, 0.3); box-shadow: 0 0 30px rgba(245, 158, 11, 0.1); }
                .status-card-large.expired { border-color: rgba(239, 68, 68, 0.3); box-shadow: 0 0 30px rgba(239, 68, 68, 0.1); }

                .status-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .status-label { font-size: 0.75rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.1em; }
                .status-badge { padding: 0.25rem 0.75rem; border-radius: 100px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.05em; }
                .status-badge.active { background: rgba(16, 185, 129, 0.2); color: #10B981; }
                .status-badge.risk { background: rgba(245, 158, 11, 0.2); color: #F59E0B; }
                .status-badge.expired { background: rgba(239, 68, 68, 0.2); color: #EF4444; }

                .status-circle-container { display: flex; justify-content: center; margin-bottom: 2rem; }
                .status-circle { position: relative; width: 160px; height: 160px; }
                .progress-ring { transform: rotate(-90deg); }
                .progress-ring__circle-bg { stroke: rgba(255,255,255,0.05); }
                .progress-ring__circle { transition: stroke-dashoffset 0.5s ease-in-out; }
                .status-card-large.active .progress-ring__circle { stroke: #10B981; }
                .status-card-large.risk .progress-ring__circle { stroke: #F59E0B; }
                .status-card-large.expired .progress-ring__circle { stroke: #EF4444; }

                .circle-content { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                .days-num { font-size: 3.5rem; font-weight: 900; line-height: 1; }
                .days-label { font-size: 0.6rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.1em; margin-top: 0.25rem; }

                .plan-details { display: flex; justify-content: space-between; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); }
                .detail-item { display: flex; flex-direction: column; gap: 0.25rem; }
                .detail-item.right { align-items: flex-end; }
                .detail-item .label { font-size: 0.65rem; font-weight: 700; opacity: 0.5; letter-spacing: 0.05em; }
                .detail-item .value { font-size: 0.9rem; font-weight: 600; }

                .actions-grid { display: flex; flex-direction: column; gap: 1rem; }
                .action-card {
                    display: flex; align-items: center; gap: 1rem; padding: 1.25rem;
                    border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.03); transition: all 0.2s;
                    width: 100%;
                }
                .action-card:active { transform: scale(0.98); }
                .action-card.primary { background: var(--color-primary); border-color: var(--color-primary); color: white; }
                .action-card h3 { font-size: 1rem; font-weight: 700; margin: 0; }
                .action-card p { font-size: 0.8rem; opacity: 0.8; margin: 0; }
                
                .action-card .icon-box { 
                    width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,0.1); 
                    display: flex; align-items: center; justify-content: center;
                }
                .action-card.primary .icon-box { background: rgba(0,0,0,0.2); }

                .logout-btn {
                    margin-top: 2rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                    color: rgba(255,255,255,0.4); font-size: 0.9rem; width: 100%; padding: 1rem;
                    transition: color 0.2s;
                }
                .logout-btn:hover { color: white; }

                .metrics-grid {
                    display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;
                }
                .metric-card {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px; padding: 1rem; display: flex; flex-direction: column;
                    align-items: center; justify-content: center; gap: 0.5rem;
                }
                .metric-card .icon { 
                    width: 32px; height: 32px; background: rgba(255,255,255,0.05); 
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                }
                .metric-card .value { font-size: 1.1rem; font-weight: 800; }
                .metric-card .label { font-size: 0.65rem; color: #888; font-weight: 600; }

                .referral-card {
                     background: linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
                     border-color: rgba(59, 130, 246, 0.2);
                }
                .referral-card .icon-box { color: #60a5fa; background: rgba(59, 130, 246, 0.1); }
            `}</style>
        </div>
    );
};

export default Status;
