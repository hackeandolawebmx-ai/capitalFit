import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../store';
import { Users, AlertTriangle, TrendingUp, Activity, MessageSquare, MoreVertical, Calendar } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        active: 0,
        risk: 0,
        expired: 0,
        totalMembers: 0,
        monthlyRevenue: 0,
        projectedRevenue: 0
    });
    const [notifications, setNotifications] = useState([]);
    const [followUpMembers, setFollowUpMembers] = useState([]);

    useEffect(() => {
        try {
            const clients = db.getClients() || [];
            const payments = db.getPayments() || [];
            const now = new Date();

            // 1. Calculate Member Stats & Notifications
            let active = 0, risk = 0, expired = 0;
            const notificationList = [];

            clients.forEach(c => {
                try {
                    const status = db.getClientStatus(c);
                    let type = null;

                    if (status === 'active') {
                        active++;
                        // Check for UPCOMING expiration (next 3 days)
                        if (c.expirationDate) {
                            const expDate = parseISO(c.expirationDate);
                            if (!isNaN(expDate)) {
                                const daysUntil = differenceInDays(expDate, now);
                                if (daysUntil >= 0 && daysUntil <= 3) {
                                    type = 'upcoming';
                                }
                            }
                        }
                    }
                    else if (status === 'risk') {
                        risk++;
                        type = 'risk';
                    }
                    else {
                        expired++;
                    }

                    if (type) {
                        notificationList.push({ ...c, type, status });
                    }
                } catch (err) {
                    console.error("Error processing client:", c, err);
                }
            });

            // 2. Calculate Revenue
            const currentMonth = now.getMonth();
            const revenue = payments.reduce((acc, p) => {
                try {
                    if (!p.date) return acc;
                    const d = parseISO(p.date);
                    if (isNaN(d)) return acc;

                    if (d.getMonth() === currentMonth && d.getFullYear() === now.getFullYear()) {
                        return acc + (parseFloat(p.amount) || 0);
                    }
                } catch (e) {
                    console.error("Error processing payment:", p, e);
                }
                return acc;
            }, 0);

            setStats({
                active,
                risk,
                expired,
                totalMembers: clients.length,
                monthlyRevenue: revenue,
                projectedRevenue: revenue + (risk * 500)
            });

            // 3. Set Notifications (Prioritize Risk, then Upcoming)
            setNotifications(notificationList.sort((a, b) => {
                if (a.type === 'risk' && b.type !== 'risk') return -1;
                if (a.type !== 'risk' && b.type === 'risk') return 1;
                const dateA = a.expirationDate || '';
                const dateB = b.expirationDate || '';
                return dateA.localeCompare(dateB);
            }));

            // 4. Set Follow Up List
            const riskAndExpired = clients.filter(c => ['risk', 'expired'].includes(db.getClientStatus(c)));
            setFollowUpMembers(riskAndExpired.sort((a, b) => {
                const dateA = a.expirationDate || '';
                const dateB = b.expirationDate || '';
                return dateB.localeCompare(dateA);
            }).slice(0, 5));

        } catch (error) {
            console.error("Critical error in Dashboard useEffect:", error);
        }
    }, []);

    const handleWhatsApp = (client) => {
        let msg = '';
        if (client.type === 'upcoming') {
            msg = encodeURIComponent(`Hola ${client.name.split(' ')[0]}, notamos que tu membresía vence pronto (${safeDateFormat(client.expirationDate)}). ¡Renueva a tiempo para mantener tu racha!`);
        } else if (client.type === 'risk') {
            msg = encodeURIComponent(`Hola ${client.name.split(' ')[0]}, tu membresía venció hace unos días. ¡Te extrañamos en el entrenamiento!`);
        } else {
            msg = encodeURIComponent(`Hola ${client.name}, tu membresía requiere atención.`);
        }
        window.open(`https://wa.me/521${client.phone.replace(/\s/g, '')}?text=${msg}`, '_blank');
    };

    const retentionRate = stats.totalMembers > 0 ? ((stats.active / stats.totalMembers) * 100).toFixed(1) : 0;
    const capacity = 100; // Mock Max Capacity
    const capacityUtilization = Math.min(((stats.active / capacity) * 100).toFixed(0), 100);

    const safeDateFormat = (dateStr) => {
        try {
            if (!dateStr) return '';
            return format(parseISO(dateStr), 'dd MMM', { locale: es });
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="dashboard-stitch">
            {/* Header Section */}
            <header className="stitch-header">
                <div>
                    <h1 className="text-3xl font-bold">Resumen del Negocio</h1>
                    <p className="text-muted">Rendimiento para <span className="text-highlight">{format(new Date(), 'MMMM yyyy', { locale: es })}</span></p>
                </div>
                <div className="header-actions">
                    <div className="quick-stat-pill">
                        <span className="label">UTILIDAD EST.</span>
                        <span className="value success">{db.formatCurrency(stats.monthlyRevenue)}</span>
                    </div>
                    <div className="divider"></div>
                    <div className="action-buttons">
                        <button className="btn btn-primary" onClick={() => navigate('/admin/clientes?action=new')}>
                            <Users size={18} /> Nuevo Miembro
                        </button>
                    </div>
                </div>
            </header>

            {/* Notifications Section */}
            {notifications.length > 0 && (
                <div className="notifications-section">
                    <div className="section-header-compact">
                        <h3 className="section-title-sm">
                            <MessageSquare size={16} className="text-accent" />
                            Panel de Notificaciones ({notifications.length})
                        </h3>
                        {/* <button className="text-xs text-accent hover:underline">Enviar a todos</button> */}
                    </div>
                    <div className="notifications-list">
                        {notifications.map(n => (
                            <div key={n.id} className={`notification-item ${n.type}`}>
                                <div className="notif-icon">
                                    {n.type === 'upcoming' ? <Calendar size={16} /> : <AlertTriangle size={16} />}
                                </div>
                                <div className="notif-content">
                                    <p className="notif-title">
                                        {n.type === 'upcoming' ? 'Vence Pronto' : 'Recién Vencido'}
                                        <span className="notif-date"> • {safeDateFormat(n.expirationDate)}</span>
                                    </p>
                                    <p className="notif-user">{n.name}</p>
                                </div>
                                <button className="whatsapp-btn-sm" onClick={() => handleWhatsApp(n)}>
                                    Enviar WhatsApp
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Summary Cards Row */}
            <div className="stitch-cards-grid">
                {/* Active Members Card */}
                <div className="stitch-card">
                    <div className="card-top">
                        <div className="icon-wrapper bg-blue-soft">
                            <Users size={20} className="text-blue" />
                        </div>
                        <span className="badge success">+12%</span>
                    </div>
                    <h3 className="card-label">Miembros Activos</h3>
                    <p className="card-value">{stats.active}</p>
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${(stats.active / (stats.totalMembers || 1)) * 100}%`, background: '#3B82F6' }}></div>
                    </div>
                </div>

                {/* At Risk Card */}
                <div className="stitch-card">
                    <div className="card-top">
                        <div className="icon-wrapper bg-yellow-soft">
                            <AlertTriangle size={20} className="text-yellow" />
                        </div>
                        <span className="badge warning">Atención</span>
                    </div>
                    <h3 className="card-label">En Riesgo</h3>
                    <p className="card-value">{stats.risk}</p>
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${(stats.risk / (stats.totalMembers || 1)) * 100}%`, background: '#EAB308' }}></div>
                    </div>
                </div>

                {/* Expired / Churn Card */}
                <div className="stitch-card">
                    <div className="card-top">
                        <div className="icon-wrapper bg-red-soft">
                            <Activity size={20} className="text-red" />
                        </div>
                        <span className="badge danger">Vencidos</span>
                    </div>
                    <h3 className="card-label">Expirados (30d)</h3>
                    <p className="card-value">{stats.expired}</p>
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${(stats.expired / (stats.totalMembers || 1)) * 100}%`, background: '#EF4444' }}></div>
                    </div>
                </div>

                {/* Revenue Card */}
                <div className="stitch-card">
                    <div className="card-top">
                        <div className="icon-wrapper bg-accent-soft">
                            <TrendingUp size={20} className="text-accent" />
                        </div>
                        <span className="badge neutral">Pipeline</span>
                    </div>
                    <h3 className="card-label">Ingresos del Mes</h3>
                    <p className="card-value">{db.formatCurrency(stats.monthlyRevenue)}</p>
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: '65%', background: 'var(--color-accent)' }}></div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="stitch-content-grid">
                {/* Left Column: Follow Up Table */}
                <div className="stitch-section main-col">
                    <div className="section-header">
                        <h2>
                            <Activity size={20} className="text-accent mr-2" />
                            Miembros a Dar Seguimiento
                        </h2>
                        <button className="link-button" onClick={() => navigate('/admin/clientes?status=risk')}>Ver Todos</button>
                    </div>
                    <div className="table-wrapper">
                        <table className="stitch-table">
                            <thead>
                                <tr>
                                    <th>MIEMBRO</th>
                                    <th>ESTADO</th>

                                    <th>ACCIÓN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {followUpMembers.length > 0 ? followUpMembers.map(member => (
                                    <tr key={member.id}>
                                        <td>
                                            <div className="member-cell">
                                                <div className="avatar-circle">{member.name.charAt(0)}</div>
                                                <div>
                                                    <p className="font-bold">{member.name}</p>
                                                    <p className="sub-text">Plan Standard</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${member.status}`}>
                                                {member.status === 'risk' ? 'POR VENCER' : 'VENCIDO'}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="action-cell">
                                                <button className="icon-btn" onClick={() => handleWhatsApp(member)} title="Enviar WhatsApp">
                                                    <MessageSquare size={16} />
                                                </button>
                                                <button className="icon-btn" onClick={() => navigate(`/admin/clientes/${member.id}`)}>
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-6 text-muted">No hay miembros pendientes de atención.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Studio Health */}
                <div className="side-col space-y-6">
                    <div className="stitch-section">
                        <h3 className="section-title">
                            <Activity size={18} className="text-green-500 mr-2" />
                            Salud del Estudio
                        </h3>
                        <div className="health-metrics">
                            <div className="metric-item">
                                <div className="flex justify-between mb-1">
                                    <span className="metric-label">Tasa de Retención</span>
                                    <span className="metric-value">{retentionRate}%</span>
                                </div>
                                <div className="metric-bar-bg">
                                    <div className="metric-bar-fill success" style={{ width: `${retentionRate}%` }}></div>
                                </div>
                            </div>
                            <div className="metric-item">
                                <div className="flex justify-between mb-1">
                                    <span className="metric-label">Ocupación (vs Capacidad)</span>
                                    <span className="metric-value">{capacityUtilization}%</span>
                                </div>
                                <div className="metric-bar-bg">
                                    <div className="metric-bar-fill accent" style={{ width: `${capacityUtilization}%` }}></div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-border mt-4">
                                <button className="btn btn-outline w-full" onClick={() => navigate('/admin/rentabilidad')}>
                                    Ver Reportes Financieros
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="stitch-section bg-accent-soft border-accent">
                        <div className="flex gap-3">
                            <div className="p-2 bg-accent/20 rounded-lg h-fit text-accent">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase text-accent tracking-wider mb-1">PRO TIP</p>
                                <p className="text-sm opacity-90 italic">
                                    Enviar recordatorios automáticos 3 días antes del vencimiento aumenta la renovación en un 15%.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .dashboard-stitch { display: flex; flex-direction: column; gap: 2rem; max-width: 1400px; margin: 0 auto; }
                
                /* Header */
                .stitch-header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 1rem; flex-wrap: wrap; gap: 1.5rem; }
                .text-highlight { color: var(--color-text); font-weight: 700; }
                .header-actions { display: flex; align-items: center; gap: 1.5rem; background: var(--color-card); border: 1px solid var(--color-border); padding: 0.75rem 1.5rem; border-radius: 12px; }
                .quick-stat-pill { display: flex; flex-direction: column; }
                .quick-stat-pill .label { font-size: 0.65rem; font-weight: 700; color: var(--color-text-muted); letter-spacing: 0.05em; }
                .quick-stat-pill .value { font-size: 1.1rem; font-weight: 800; color: var(--color-success); }
                .divider { width: 1px; height: 32px; background: var(--color-border); }
                
                /* Cards */
                .stitch-cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
                .stitch-card { background: var(--color-card); border: 1px solid var(--color-border); border-radius: 16px; padding: 1.5rem; transition: transform 0.2s; }
                .stitch-card:hover { transform: translateY(-2px); border-color: var(--color-border-glow); }
                .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
                .icon-wrapper { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
                .badge.success { background: rgba(16, 185, 129, 0.1); color: #10B981; }
                .badge.warning { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
                .badge.danger { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
                .badge.neutral { background: rgba(255, 255, 255, 0.05); color: #9CA3AF; }
                
                .bg-blue-soft { background: rgba(59, 130, 246, 0.1); }
                .text-blue { color: #3B82F6; }
                .bg-yellow-soft { background: rgba(234, 179, 8, 0.1); }
                .text-yellow { color: #EAB308; }
                .bg-red-soft { background: rgba(239, 68, 68, 0.1); }
                .text-red { color: #EF4444; }
                .bg-accent-soft { background: var(--color-accent-soft); }
                .text-accent { color: var(--color-accent); }

                .card-label { font-size: 0.9rem; color: var(--color-text-muted); font-weight: 500; margin-bottom: 0.25rem; }
                .card-value { font-size: 2rem; font-weight: 800; line-height: 1; margin-bottom: 1rem; }
                .progress-container { width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
                .progress-bar { height: 100%; border-radius: 4px; }

                /* Grid Layout */
                .stitch-content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
                @media (max-width: 1024px) { .stitch-content-grid { grid-template-columns: 1fr; } }

                /* Sections */
                .stitch-section { background: var(--color-card); border: 1px solid var(--color-border); border-radius: 16px; padding: 1.5rem; overflow: hidden; }
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--color-border); }
                .section-header h2 { font-size: 1.1rem; display: flex; align-items: center; margin: 0; }
                .link-button { background: none; border: none; color: var(--color-accent); font-weight: 600; font-size: 0.85rem; cursor: pointer; }
                .link-button:hover { text-decoration: underline; }

                /* Table */
                .table-wrapper { overflow-x: auto; }
                .stitch-table { width: 100%; border-collapse: collapse; text-align: left; }
                .stitch-table th { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); padding: 0.75rem 1rem; border-bottom: 1px solid var(--color-border); }
                .stitch-table td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.02); }
                .stitch-table tr:hover { background: rgba(255,255,255,0.02); }
                .member-cell { display: flex; align-items: center; gap: 1rem; }
                .avatar-circle { width: 36px; height: 36px; border-radius: 50%; background: #262626; color: var(--color-text-muted); display: flex; align-items: center; justify-content: center; font-weight: 700; border: 1px solid var(--color-border); }
                .sub-text { font-size: 0.75rem; color: var(--color-text-muted); }
                .status-pill { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.7rem; font-weight: 800; }
                .status-pill.risk { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
                .status-pill.expired { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
                
                .action-cell { display: flex; gap: 0.5rem; justify-content: flex-end; }
                .icon-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: transparent; border: 1px solid transparent; color: var(--color-text-muted); cursor: pointer; transition: 0.2s; }
                .icon-btn:hover { background: rgba(255,255,255,0.05); color: white; border-color: var(--color-border); }

                /* Studio Health */
                .section-title { margin-bottom: 1.5rem; font-size: 1.1rem; display: flex; align-items: center; }
                .health-metrics { display: flex; flex-direction: column; gap: 1.5rem; }
                .metric-label { font-size: 0.85rem; color: var(--color-text-muted); }
                .metric-value { font-weight: 700; }
                .metric-bar-bg { height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
                .metric-bar-fill { height: 100%; border-radius: 4px; }
                .metric-bar-fill.success { background: #10B981; }
                .metric-bar-fill.accent { background: var(--color-accent); }
                
                .bg-accent-soft { background: rgba(243, 156, 52, 0.1); }
                .border-accent { border: 1px solid rgba(243, 156, 52, 0.2); }

                /* Notifications Panel */
                .notifications-section {
                    background: linear-gradient(145deg, rgba(20,20,20,0.8), rgba(10,10,10,0.9));
                    border: 1px solid rgba(243, 156, 52, 0.3);
                    border-radius: 16px;
                    padding: 1.25rem;
                    margin-bottom: 0.5rem;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                }
                .section-header-compact { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .section-title-sm { font-size: 0.9rem; font-weight: 700; color: white; display: flex; align-items: center; gap: 0.5rem; margin: 0; }
                
                .notifications-list { display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.5rem; }
                .notifications-list::-webkit-scrollbar { height: 4px; }
                .notifications-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
                
                .notification-item {
                    min-width: 260px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px;
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    transition: transform 0.2s;
                }
                .notification-item:hover { transform: translateY(-2px); background: rgba(255,255,255,0.05); }
                .notification-item.upcoming { border-left: 3px solid var(--color-success); }
                .notification-item.risk { border-left: 3px solid var(--color-warning); }
                
                .notif-icon { 
                    width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.05); 
                    display: flex; align-items: center; justify-content: center; color: var(--color-text-muted);
                }
                .notification-item.upcoming .notif-icon { color: var(--color-success); background: rgba(16, 185, 129, 0.1); }
                .notification-item.risk .notif-icon { color: var(--color-warning); background: rgba(245, 158, 11, 0.1); }

                .notif-content { flex: 1; }
                .notif-title { font-size: 0.7rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin: 0 0 0.2rem 0; }
                .notif-date { opacity: 0.7; font-weight: 400; }
                .notif-user { font-weight: 700; font-size: 0.9rem; margin: 0; color: white; }

                .whatsapp-btn-sm {
                    background: #25D366; color: white; border: none; padding: 0.4rem 0.8rem;
                    border-radius: 6px; font-size: 0.7rem; font-weight: 700; cursor: pointer;
                    white-space: nowrap;
                }
                .whatsapp-btn-sm:hover { background: #1fee59; }
            `}</style>
        </div>
    );
};

export default Dashboard;
