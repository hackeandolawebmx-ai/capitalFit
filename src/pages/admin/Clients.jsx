import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../../store';
import { Plus, Search, MessageSquare, RefreshCw, Filter, Download, MoreVertical, CheckCircle, AlertTriangle, XCircle, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

const Clients = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const statusFilter = searchParams.get('status');
    const [clients, setClients] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({ total: 0, active: 0, risk: 0, expired: 0 });

    const [newClient, setNewClient] = useState({
        name: '',
        phone: '',
        birthDate: '',
        planId: '',
        paymentMethod: 'cash'
    });
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        const allClients = db.getClients();
        setClients(allClients);
        setPlans(db.getPlans());

        // Calculate Stats
        let active = 0, risk = 0, expired = 0;
        allClients.forEach(c => {
            const status = db.getClientStatus(c);
            if (status === 'active') active++;
            else if (status === 'risk') risk++;
            else expired++;
        });
        setStats({ total: allClients.length, active, risk, expired });
    }, [showModal]);

    const handleAdd = (e) => {
        e.preventDefault();
        const createdClient = db.addClient({
            name: newClient.name,
            phone: newClient.phone,
            birthDate: newClient.birthDate,
            activePlanId: '',
            expirationDate: new Date().toISOString(),
            lastPaymentDate: null
        });

        if (newClient.planId) {
            const selectedPlan = plans.find(p => p.id === newClient.planId);
            if (selectedPlan) {
                db.addPayment({
                    clientId: createdClient.id,
                    planId: selectedPlan.id,
                    amount: selectedPlan.price,
                    method: newClient.paymentMethod
                });
            }
        }
        setShowModal(false);
        setNewClient({ name: '', phone: '', birthDate: '', planId: '', paymentMethod: 'cash' });
        setClients(db.getClients()); // Refresh list
    };

    const handleWhatsApp = (client) => {
        const msg = encodeURIComponent(`Hola ${client.name}, tu membresía vence el ${client.expirationDate ? format(parseISO(client.expirationDate), 'dd/MM') : 'hoy'}.`);
        window.open(`https://wa.me/521${client.phone}?text=${msg}`, '_blank');
    };

    const filtered = clients.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
        const matchesStatus = statusFilter ? db.getClientStatus(c) === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="clients-stitch">
            {/* Header */}
            <header className="stitch-header">
                <div>
                    <h1 className="text-2xl font-bold">Lista de Miembros</h1>
                    <p className="text-muted">Gestiona membresías, vencimientos y recordatorios.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-outline" style={{ width: 'auto' }}>
                        <Download size={18} /> Exportar CSV
                    </button>
                    <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Nuevo Miembro
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="stats-grid">
                <div className="stat-box">
                    <p className="stat-label">TOTAL MIEMBROS</p>
                    <div className="flex justify-between items-center">
                        <h3 className="stat-value">{stats.total}</h3>
                        <span className="badge success">+12%</span>
                    </div>
                </div>
                <div className="stat-box">
                    <p className="stat-label">ACTIVOS AHORA</p>
                    <div className="flex justify-between items-center">
                        <h3 className="stat-value text-success">{stats.active}</h3>
                        <CheckCircle size={20} className="text-success opacity-50" />
                    </div>
                </div>
                <div className="stat-box">
                    <p className="stat-label">EN RIESGO</p>
                    <div className="flex justify-between items-center">
                        <h3 className="stat-value text-warning">{stats.risk}</h3>
                        <AlertTriangle size={20} className="text-warning opacity-50" />
                    </div>
                </div>
                <div className="stat-box">
                    <p className="stat-label">VENCIDOS</p>
                    <div className="flex justify-between items-center">
                        <h3 className="stat-value text-danger">{stats.expired}</h3>
                        <XCircle size={20} className="text-danger opacity-50" />
                    </div>
                </div>
            </div>

            {/* Toolbar & Filter */}
            <div className="table-container glass-card">
                <div className="toolbar">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o teléfono..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            className="filter-select"
                            value={statusFilter || ''}
                            onChange={e => setSearchParams(e.target.value ? { status: e.target.value } : {})}
                        >
                            <option value="">Todos los Estados</option>
                            <option value="active">Activos</option>
                            <option value="risk">En Riesgo</option>
                            <option value="expired">Vencidos</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="stitch-table">
                        <thead>
                            <tr>
                                <th>MIEMBRO</th>
                                <th>ESTADO</th>
                                <th>FECHA VENCIMIENTO</th>
                                <th>DÍAS RESTANTES/VENCIDOS</th>
                                <th className="text-right">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(client => {
                                const status = db.getClientStatus(client);
                                const days = client.expirationDate ? differenceInDays(parseISO(client.expirationDate), new Date()) : 0;
                                const isExpired = days < 0;

                                return (
                                    <tr key={client.id} className="group">
                                        <td>
                                            <div className="member-cell">
                                                <div className="avatar">{client.name.charAt(0)}</div>
                                                <div>
                                                    <p className="font-bold cursor-pointer hover:underline" onClick={() => navigate(`/admin/clientes/${client.id}`)}>{client.name}</p>
                                                    <p className="sub-text">{client.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${status}`}>
                                                {status === 'active' ? 'ACTIVO' : status === 'risk' ? 'RIESGO' : 'VENCIDO'}
                                            </span>
                                        </td>
                                        <td className="font-medium">
                                            {client.expirationDate ? format(parseISO(client.expirationDate), 'MMM dd, yyyy', { locale: es }) : '-'}
                                        </td>
                                        <td>
                                            <span className={`font-bold ${isExpired ? 'text-danger' : days < 5 ? 'text-warning' : 'text-muted'}`}>
                                                {isExpired ? `${Math.abs(days)} Días Vencido` : `${days} Días Restantes`}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="btn-xs btn-primary" onClick={() => navigate(`/admin/pagos?clientId=${client.id}`)}>
                                                    RENOVAR
                                                </button>
                                                <button className="btn-xs btn-whatsapp" onClick={() => handleWhatsApp(client)}>
                                                    <MessageSquare size={14} /> WHATSAPP
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-muted">No se encontraron miembros.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                <div className="table-footer">
                    <span className="text-muted text-sm">Mostrando {filtered.length} de {stats.total} miembros</span>
                    <div className="pagination">
                        <button className="page-btn" disabled><ChevronLeft size={18} /></button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>
                        <button className="page-btn"><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal glass-card">
                        <div className="modal-header">
                            <h2>Nuevo Miembro</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><XCircle size={20} /></button>
                        </div>
                        <form onSubmit={handleAdd}>
                            <div className="form-group">
                                <label>Nombre Completo</label>
                                <input required type="text" placeholder="Ej. Juan Perez" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Teléfono Movil</label>
                                <input required type="tel" placeholder="10 dígitos" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Fecha de Nacimiento</label>
                                <input required type="date" value={newClient.birthDate} onChange={e => setNewClient({ ...newClient, birthDate: e.target.value })} />
                            </div>
                            <hr className="my-4 border-border" />
                            <div className="form-group">
                                <label>Plan Inicial (Opcional)</label>
                                <select value={newClient.planId} onChange={e => setNewClient({ ...newClient, planId: e.target.value })} className="input-select">
                                    <option value="">Seleccionar Plan...</option>
                                    {plans.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>)}
                                </select>
                            </div>
                            {newClient.planId && (
                                <div className="form-group">
                                    <label>Método de Pago</label>
                                    <select value={newClient.paymentMethod} onChange={e => setNewClient({ ...newClient, paymentMethod: e.target.value })} className="input-select">
                                        <option value="cash">Efectivo</option>
                                        <option value="card">Tarjeta / Transferencia</option>
                                    </select>
                                </div>
                            )}
                            <div className="form-actions mt-6 flex justify-end gap-3">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Crear Cliente</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .clients-stitch { display: flex; flex-direction: column; gap: 2rem; max-width: 1400px; margin: 0 auto; }
                
                /* Header */
                .stitch-header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 1rem; flex-wrap: wrap; gap: 1rem; }
                
                /* Stats Grid */
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
                .stat-box { background: var(--color-card); border: 1px solid var(--color-border); padding: 1.25rem; border-radius: 12px; }
                .stat-label { font-size: 0.7rem; font-weight: 700; color: var(--color-text-muted); margin-bottom: 0.5rem; letter-spacing: 0.05em; }
                .stat-value { font-size: 1.5rem; font-weight: 800; }
                .text-success { color: #10B981; }
                .text-warning { color: #F59E0B; }
                .text-danger { color: #EF4444; }

                /* Toolbar */
                .table-container { background: var(--color-card); border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden; }
                .toolbar { padding: 1rem; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; background: rgba(255,255,255,0.02); }
                .search-wrapper { position: relative; flex: 1; max-width: 400px; }
                .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); }
                .search-wrapper input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.5rem; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 8px; color: white; font-size: 0.9rem; }
                .filter-select { padding: 0.6rem 1rem; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 8px; color: white; font-size: 0.9rem; cursor: pointer; }

                /* Table */
                .table-responsive { overflow-x: auto; }
                .stitch-table { width: 100%; border-collapse: collapse; text-align: left; }
                .stitch-table th { padding: 1rem 1.5rem; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); border-bottom: 1px solid var(--color-border); background: rgba(255,255,255,0.02); }
                .stitch-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--color-border); font-size: 0.9rem; vertical-align: middle; }
                .stitch-table tr:last-child td { border-bottom: none; }
                .stitch-table tr:hover { background: rgba(255,255,255,0.02); }

                .member-cell { display: flex; align-items: center; gap: 1rem; }
                .avatar { width: 36px; height: 36px; border-radius: 50%; background: #262626; color: var(--color-text-muted); display: flex; align-items: center; justify-content: center; font-weight: 700; border: 1px solid var(--color-border); }
                .sub-text { font-size: 0.75rem; color: var(--color-text-muted); }

                .status-pill { padding: 0.25rem 0.75rem; border-radius: 100px; font-size: 0.7rem; font-weight: 800; }
                .status-pill.active { background: rgba(16, 185, 129, 0.1); color: #10B981; }
                .status-pill.risk { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
                .status-pill.expired { background: rgba(239, 68, 68, 0.1); color: #EF4444; }

                .btn-xs { padding: 0.4rem 0.8rem; font-size: 0.7rem; border-radius: 6px; font-weight: 700; display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer; border: none; transition: 0.2s; }
                .btn-whatsapp { background: #25D366; color: white; }
                .btn-whatsapp:hover { background: #1ebe57; }

                /* Footer */
                .table-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); }
                .pagination { display: flex; gap: 0.5rem; }
                .page-btn { width: 32px; height: 32px; border-radius: 6px; border: 1px solid var(--color-border); background: transparent; color: var(--color-text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; }
                .page-btn.active { background: var(--color-accent); color: white; border-color: var(--color-accent); font-weight: bold; }
                .page-btn:hover:not(.active) { background: rgba(255,255,255,0.05); color: white; }

                /* Helper */
                .input-select { width: 100%; padding: 0.85rem; background: rgba(0,0,0,0.3); border: 1px solid var(--color-border); color: white; border-radius: 8px; }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }
                
                .modal {
                    width: 100%;
                    max-width: 500px;
                    padding: 2rem;
                    background: var(--color-card);
                    border: 1px solid var(--color-border);
                    border-radius: 12px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
                }

                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .close-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; transition: color 0.2s; }
                .close-btn:hover { color: white; }
                
                /* Form Styles */
                .form-group { margin-bottom: 1rem; }
                .form-group label { display: block; font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 0.5rem; font-weight: 500; }
                .form-group input, .form-group select {
                    width: 100%;
                    padding: 0.75rem;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid var(--color-border);
                    color: white;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    transition: border-color 0.2s;
                }
                .form-group input:focus, .form-group select:focus {
                    outline: none;
                    border-color: var(--color-primary);
                }
            `}</style>
        </div>
    );
};

export default Clients;
