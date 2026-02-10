import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../store';
import { ArrowLeft, MessageSquare, Calendar, CreditCard, Activity, Clock, ShieldAlert, CheckCircle, XCircle, User, Phone, Save, X } from 'lucide-react';
import { format, parseISO, addDays, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

const ClientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', phone: '', birthDate: '' });

    useEffect(() => {
        const c = db.getClients().find(client => client.id === parseInt(id) || client.id === id);
        if (c) {
            setClient(c);
            setEditForm({ name: c.name, phone: c.phone, birthDate: c.birthDate });

            // Mock payments if not functioning correctly or use store
            // Assuming getPayments returns all payments, filter by client
            const allPayments = db.getPayments();
            const clientPayments = allPayments.filter(p => p.clientId === c.id || p.clientId === c.id.toString()).sort((a, b) => new Date(b.date) - new Date(a.date));
            setPayments(clientPayments);
        }
        setLoading(false);
    }, [id]);

    const handleSave = (e) => {
        e.preventDefault();
        // Mock update - in real app would call db.updateClient
        // For now, update local state
        const updatedClient = { ...client, ...editForm };
        setClient(updatedClient);
        setIsEditing(false);
        // Note: db.updateClient would need to be implemented or we just rely on local state for demo
        // db.updateClient(client.id, editForm); 
    };

    if (loading) return <div className="p-8 text-center text-muted">Cargando perfil...</div>;
    if (!client) return (
        <div className="flex flex-col items-center justify-center h-64 text-muted">
            <h2 className="text-xl font-bold mb-4">Cliente no encontrado</h2>
            <button onClick={() => navigate('/admin/clientes')} className="btn-stitch-primary">Volver al Directorio</button>
        </div>
    );

    const status = db.getClientStatus ? db.getClientStatus(client) : 'active';
    const statusConfig = {
        active: { label: 'MIEMBRO ACTIVO', icon: <CheckCircle size={20} />, color: 'var(--color-success)', bg: 'rgba(16, 185, 129, 0.1)' },
        risk: { label: 'EN RIESGO', icon: <Clock size={20} />, color: 'var(--color-warning)', bg: 'rgba(245, 158, 11, 0.1)' },
        expired: { label: 'MEMBRESÍA EXPIRADA', icon: <XCircle size={20} />, color: 'var(--color-danger)', bg: 'rgba(239, 68, 68, 0.1)' }
    };
    const currentStatus = statusConfig[status] || statusConfig.expired;

    const handleWhatsApp = () => {
        const msg = encodeURIComponent(`Hola ${client.name.split(' ')[0]}, te escribimos de Capital Fit. Queríamos recordarte que tu membresía vence el ${client.expirationDate ? format(parseISO(client.expirationDate), 'dd/MM/yyyy') : 'pronto'}.`);
        window.open(`https://wa.me/521${client.phone.replace(/\s/g, '')}?text=${msg}`, '_blank');
    };

    return (
        <div className="client-detail-stitch">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/admin/clientes')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-content">
                    <h1>Perfil de Socio</h1>
                    <div className="id-badge">ID: {client.id}</div>
                </div>
                <div className="header-actions">
                    <button className="action-btn outline" onClick={() => setIsEditing(true)}>
                        <Activity size={18} /> Editar
                    </button>
                    <button className="action-btn outline" onClick={handleWhatsApp}>
                        <MessageSquare size={18} /> Contactar
                    </button>
                    <button className="action-btn primary" onClick={() => navigate(`/admin/pagos?clientId=${client.id}`)}>
                        <CreditCard size={18} /> Nueva Transacción
                    </button>
                </div>
            </header>

            <div className="dashboard-grid">
                {/* Profile Card */}
                <div className="card-stitch profile-card">
                    <div className="card-header">
                        <User className="header-icon" size={20} />
                        <h3>Información Personal</h3>
                    </div>
                    <div className="profile-details">
                        <div className="detail-group">
                            <label>NOMBRE COMPLETO</label>
                            <div className="value">{client.name}</div>
                        </div>
                        <div className="detail-group">
                            <label>TELÉFONO DE CONTACTO</label>
                            <div className="value flex items-center gap-2">
                                <Phone size={14} className="opacity-50" /> {client.phone}
                            </div>
                        </div>
                        <div className="detail-group">
                            <label>FECHA DE NACIMIENTO</label>
                            <div className="value">
                                {client.birthDate ? format(parseISO(client.birthDate), 'dd MMMM yyyy', { locale: es }) : 'No registrada'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <div className="card-stitch status-card">
                    <div className="card-header">
                        <Activity className="header-icon" size={20} />
                        <h3>Estado de Membresía</h3>
                    </div>
                    <div className="status-indicator" style={{ borderColor: currentStatus.color, background: currentStatus.bg }}>
                        <div className="indicator-icon" style={{ color: currentStatus.color }}>{currentStatus.icon}</div>
                        <div className="indicator-text">
                            <h4 style={{ color: currentStatus.color }}>{currentStatus.label}</h4>
                            <p>
                                {status === 'active' ? 'Tu acceso está vigente hasta el:' : 'La membresía expiró el:'}
                            </p>
                            <div className="date-highlight">
                                {client.expirationDate ? format(parseISO(client.expirationDate), 'dd MMMM yyyy', { locale: es }) : 'Fecha desconocida'}
                            </div>
                        </div>
                    </div>
                    <div className="plan-badge">
                        <span>PLAN ACTUAL</span>
                        <strong>{db.getPlans().find(p => p.id === client.activePlanId)?.name || 'Sin Plan Activo'}</strong>
                    </div>
                </div>

                {/* History Card */}
                <div className="card-stitch history-card">
                    <div className="card-header">
                        <CreditCard className="header-icon" size={20} />
                        <h3>Historial de Pagos</h3>
                    </div>
                    <div className="table-wrapper">
                        <table className="stitch-table">
                            <thead>
                                <tr>
                                    <th>FECHA</th>
                                    <th>CONCEPTO</th>
                                    <th>MÉTODO</th>
                                    <th className="text-right">MONTO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length > 0 ? payments.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div className="date-cell">
                                                <Calendar size={12} />
                                                {format(parseISO(p.date), 'dd MMM yyyy')}
                                            </div>
                                        </td>
                                        <td><span className="concept-pill">{p.planName || 'Pago'}</span></td>
                                        <td className="uppercase text-xs font-bold opacity-70">{p.method === 'cash' ? 'Efectivo' : 'Transferencia'}</td>
                                        <td className="text-right font-mono font-bold text-success">{db.formatCurrency(p.amount)}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="empty-state">No hay historial de pagos disponible.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="modal-overlay">
                    <div className="glass-modal">
                        <div className="modal-header">
                            <h2>Editar Perfil</h2>
                            <button className="close-btn" onClick={() => setIsEditing(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="form-group-stitch">
                                <label>NOMBRE COMPLETO</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group-stitch">
                                <label>TELÉFONO</label>
                                <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group-stitch">
                                <label>FECHA DE NACIMIENTO</label>
                                <input
                                    type="date"
                                    value={editForm.birthDate}
                                    onChange={e => setEditForm({ ...editForm, birthDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-stitch-ghost" onClick={() => setIsEditing(false)}>Cancelar</button>
                                <button type="submit" className="btn-stitch-primary"><Save size={18} /> Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .client-detail-stitch { padding-bottom: 3rem; }
                
                .page-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2.5rem; }
                .back-btn { 
                    background: rgba(255,255,255,0.05); border: 1px solid var(--color-border); 
                    color: white; width: 40px; height: 40px; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
                }
                .back-btn:hover { background: rgba(255,255,255,0.1); transform: translateX(-2px); }

                .header-content h1 { font-size: 1.75rem; font-weight: 800; margin: 0; line-height: 1; }
                .id-badge { 
                    font-size: 0.75rem; font-family: monospace; color: var(--color-text-muted); 
                    background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; 
                    display: inline-block; margin-top: 0.5rem;
                }

                .header-actions { margin-left: auto; display: flex; gap: 1rem; }
                .action-btn { 
                    display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; 
                    border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
                }
                .action-btn.outline { background: transparent; border: 1px solid var(--color-border); color: white; }
                .action-btn.outline:hover { background: rgba(255,255,255,0.05); border-color: white; }
                .action-btn.primary { background: var(--color-primary); border: 1px solid var(--color-primary); color: white; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); }
                .action-btn.primary:hover { background: #ea580c; transform: translateY(-1px); }

                .dashboard-grid { 
                    display: grid; grid-template-columns: 350px 1fr; gap: 1.5rem; 
                    grid-template-areas: "profile status" "profile history";
                }
                .profile-card { grid-area: profile; }
                .status-card { grid-area: status; }
                .history-card { grid-area: history; }

                @media (max-width: 1024px) {
                    .dashboard-grid { grid-template-columns: 1fr; grid-template-areas: "status" "profile" "history"; }
                }

                .card-stitch {
                    background: var(--color-card); border: 1px solid var(--color-border); 
                    border-radius: 20px; padding: 1.5rem; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
                }
                .card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1rem; }
                .header-icon { color: var(--color-text-muted); }
                .card-header h3 { font-size: 1rem; font-weight: 700; margin: 0; letter-spacing: 0.02em; }

                .profile-details { display: flex; flex-direction: column; gap: 1.5rem; }
                .detail-group label { display: block; font-size: 0.7rem; font-weight: 800; color: var(--color-text-muted); margin-bottom: 0.4rem; letter-spacing: 0.05em; }
                .detail-group .value { font-size: 1.1rem; font-weight: 500; color: white; }

                .status-indicator { 
                    display: flex; gap: 1rem; padding: 1.5rem; border-radius: 16px; border: 1px solid;
                    margin-bottom: 1.5rem;
                }
                .indicator-text h4 { font-size: 1.1rem; font-weight: 800; margin: 0 0 0.5rem 0; }
                .indicator-text p { font-size: 0.85rem; opacity: 0.8; margin: 0; }
                .date-highlight { font-size: 1.25rem; font-weight: 700; margin-top: 0.5rem; }

                .plan-badge { 
                    display: flex; justify-content: space-between; align-items: center; 
                    background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px;
                }
                .plan-badge span { font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); }
                .plan-badge strong { font-size: 1rem; color: var(--color-primary); }

                .stitch-table { width: 100%; border-collapse: separate; border-spacing: 0; }
                .stitch-table th { 
                    text-align: left; padding: 1rem; font-size: 0.7rem; font-weight: 800; 
                    color: var(--color-text-muted); border-bottom: 1px solid var(--color-border);
                    letter-spacing: 0.05em;
                }
                .stitch-table td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 0.9rem; }
                .stitch-table tr:last-child td { border-bottom: none; }
                
                .date-cell { display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-muted); font-size: 0.85rem; font-weight: 600; }
                .concept-pill { background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; }
                .empty-state { text-align: center; padding: 3rem; color: var(--color-text-muted); font-style: italic; }

                /* Modal Styles */
                .modal-overlay { 
                    position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center; z-index: 100;
                }
                .glass-modal {
                    background: #111; border: 1px solid var(--color-border); border-radius: 20px;
                    width: 100%; max-width: 500px; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .modal-header h2 { font-size: 1.5rem; font-weight: 800; margin: 0; }
                .close-btn { background: transparent; border: none; color: white; cursor: pointer; opacity: 0.5; transition: opacity 0.2s; }
                .close-btn:hover { opacity: 1; }

                .form-group-stitch { margin-bottom: 1.5rem; }
                .form-group-stitch label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); margin-bottom: 0.5rem; }
                .form-group-stitch input { 
                    width: 100%; background: rgba(255,255,255,0.03); border: 1px solid var(--color-border);
                    padding: 0.85rem; border-radius: 8px; color: white; transition: all 0.2s;
                }
                .form-group-stitch input:focus { border-color: var(--color-primary); outline: none; background: rgba(255,255,255,0.05); }

                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
                .btn-stitch-ghost { background: transparent; border: none; color: var(--color-text-muted); font-weight: 600; cursor: pointer; padding: 0.75rem 1.5rem; }
                .btn-stitch-ghost:hover { color: white; }
                .btn-stitch-primary { 
                    background: var(--color-primary); color: white; border: none; border-radius: 8px;
                    padding: 0.75rem 1.5rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
                }
                .btn-stitch-primary:hover { background: #ea580c; }
            `}</style>
        </div>
    );
};

export default ClientDetail;
