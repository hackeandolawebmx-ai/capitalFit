import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../../store';
import { Plus, Search, DollarSign, Calendar, CreditCard, ChevronRight, X, User, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const Payments = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const preSelectedClientId = searchParams.get('clientId');
    const [payments, setPayments] = useState([]);
    const [clients, setClients] = useState([]);
    const [plans, setPlans] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        clientId: '',
        planId: '',
        amount: '',
        method: 'cash'
    });
    const [clientSearch, setClientSearch] = useState('');
    const [showClientResults, setShowClientResults] = useState(false);

    useEffect(() => {
        setPayments(db.getPayments().reverse());
        setClients(db.getClients());
        setPlans(db.getPlans());

        if (preSelectedClientId) {
            const c = db.getClients().find(cl => cl.id === parseInt(preSelectedClientId) || cl.id === preSelectedClientId);
            if (c) {
                setFormData(prev => ({ ...prev, clientId: c.id }));
                setClientSearch(c.name);
                setShowModal(true);
            }
            setSearchParams({}, { replace: true });
        }

        const handleClickOutside = (e) => {
            if (!e.target.closest('.searchable-select')) {
                setShowClientResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [preSelectedClientId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const plan = plans.find(p => p.id === parseInt(formData.planId) || p.id === formData.planId);

        db.addPayment({
            clientId: formData.clientId,
            planId: formData.planId,
            amount: parseFloat(formData.amount),
            method: formData.method,
            planName: plan ? plan.name : 'Personalizado'
        });

        setShowModal(false);
        setFormData({ clientId: '', planId: '', amount: '', method: 'cash' });
        setClientSearch('');
        setPayments(db.getPayments().reverse());
    };

    const handlePlanChange = (e) => {
        const pid = e.target.value;
        const plan = plans.find(p => p.id === parseInt(pid) || p.id === pid);
        setFormData({
            ...formData,
            planId: pid,
            amount: plan ? plan.price : ''
        });
    };

    const getClientName = (id) => {
        const c = clients.find(cl => cl.id === id);
        return c ? c.name : 'Cliente Eliminado';
    };

    return (
        <div className="payments-view-stitch">
            <header className="page-header">
                <div className="header-info">
                    <h1>Historial de Transacciones</h1>
                    <p className="subtitle">Gestión centralizada de ingresos y renovaciones</p>
                </div>
                <button className="btn-stitch-primary" onClick={() => setShowModal(true)}>
                    <Plus size={20} strokeWidth={2.5} /> Registrar Nuevo Pago
                </button>
            </header>

            <div className="card-stitch table-card">
                <div className="table-responsive">
                    <table className="stitch-table">
                        <thead>
                            <tr>
                                <th>FECHA</th>
                                <th>CLIENTE</th>
                                <th>CONCEPTO</th>
                                <th>MÉTODO</th>
                                <th className="text-right">MONTO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-state">
                                        <div className="empty-content">
                                            <div className="empty-icon"><CreditCard size={32} /></div>
                                            <p>No se han registrado transacciones aún.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                payments.map(p => (
                                    <tr key={p.id} className="payment-row">
                                        <td>
                                            <div className="date-cell">
                                                <Calendar size={14} className="opacity-50" />
                                                <span>{format(parseISO(p.date), 'dd MMM yyyy')}</span>
                                                <span className="time-hint">{format(parseISO(p.date), 'HH:mm')}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="client-cell">
                                                <div className="avatar-mini">{getClientName(p.clientId).charAt(0)}</div>
                                                <span className="client-name">{getClientName(p.clientId)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="concept-tag">{p.planName}</span>
                                        </td>
                                        <td>
                                            <div className={`method-badge ${p.method}`}>
                                                {p.method === 'cash' ? 'EFECTIVO' : 'TRANSFERENCIA'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="amount-cell">
                                                {db.formatCurrency(p.amount)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-modal">
                        <div className="modal-header">
                            <h2>Registrar Pago</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group-stitch searchable-select">
                                <label>CLIENTE A RENOVAR</label>
                                <div className="input-wrapper">
                                    <User className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre..."
                                        value={clientSearch}
                                        onChange={(e) => {
                                            setClientSearch(e.target.value);
                                            setShowClientResults(true);
                                        }}
                                        onFocus={() => setShowClientResults(true)}
                                        className="stitch-input"
                                        required
                                    />
                                </div>
                                {showClientResults && clientSearch.length > 0 && (
                                    <div className="autocomplete-results">
                                        {clients
                                            .filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
                                            .slice(0, 5)
                                            .map(c => (
                                                <div key={c.id} className="result-item" onClick={() => {
                                                    setFormData({ ...formData, clientId: c.id });
                                                    setClientSearch(c.name);
                                                    setShowClientResults(false);
                                                }}>
                                                    <span>{c.name}</span>
                                                    <small>ID: {c.id}</small>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>

                            <div className="form-group-stitch">
                                <label>PLAN O SERVICIO</label>
                                <select
                                    required
                                    value={formData.planId}
                                    onChange={handlePlanChange}
                                    className="stitch-select"
                                >
                                    <option value="">Seleccionar Plan...</option>
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group-stitch">
                                <label>MONTO A COBRAR</label>
                                <div className="input-wrapper">
                                    <DollarSign className="input-icon text-success" size={18} />
                                    <input
                                        required
                                        type="number"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        className="stitch-input amount-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group-stitch">
                                <label>MÉTODO DE PAGO</label>
                                <div className="payment-methods-grid">
                                    <label className={`method-card ${formData.method === 'cash' ? 'active' : ''}`}>
                                        <input type="radio" value="cash" checked={formData.method === 'cash'} onChange={e => setFormData({ ...formData, method: e.target.value })} />
                                        <span>Efectivo</span>
                                    </label>
                                    <label className={`method-card ${formData.method === 'transfer' ? 'active' : ''}`}>
                                        <input type="radio" value="transfer" checked={formData.method === 'transfer'} onChange={e => setFormData({ ...formData, method: e.target.value })} />
                                        <span>Transferencia</span>
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-stitch-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-stitch-primary full-width">
                                    <CheckCircle size={18} /> Confirmar Pago
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .payments-view-stitch { max-width: 1200px; margin: 0 auto; padding-bottom: 3rem; }
                
                .page-header { 
                    display: flex; justify-content: space-between; align-items: flex-end; 
                    margin-bottom: 2.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1.5rem;
                }
                .header-info h1 { font-size: 2rem; font-weight: 800; margin: 0; line-height: 1.1; letter-spacing: -0.02em; }
                .subtitle { color: var(--color-text-muted); font-size: 0.95rem; margin: 0.5rem 0 0 0; }

                .btn-stitch-primary { 
                    background: var(--color-primary); color: white; border: none; border-radius: 12px;
                    padding: 0.85rem 1.75rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.75rem;
                    box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4); transition: all 0.2s;
                }
                .btn-stitch-primary:hover { background: #ea580c; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(249, 115, 22, 0.5); }
                .btn-stitch-ghost { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-muted); padding: 0.85rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; }
                .btn-stitch-ghost:hover { border-color: white; color: white; }

                .card-stitch {
                    background: var(--color-card); border: 1px solid var(--color-border); 
                    border-radius: 20px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5); overflow: hidden;
                }
                
                .stitch-table { width: 100%; border-collapse: separate; border-spacing: 0; }
                .stitch-table th { 
                    text-align: left; padding: 1.25rem 1.5rem; font-size: 0.7rem; font-weight: 800; 
                    color: var(--color-text-muted); border-bottom: 1px solid var(--color-border);
                    letter-spacing: 0.1em; background: rgba(0,0,0,0.2);
                }
                .stitch-table td { padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 0.95rem; }
                .payment-row:hover td { background: rgba(255,255,255,0.02); }

                .date-cell { display: flex; flex-direction: column; gap: 0.2rem; }
                .date-cell span { font-weight: 600; font-size: 0.9rem; }
                .time-hint { font-size: 0.75rem !important; color: var(--color-text-muted); font-weight: 400 !important; }
                
                .client-cell { display: flex; align-items: center; gap: 0.75rem; }
                .avatar-mini { 
                    width: 32px; height: 32px; background: linear-gradient(135deg, var(--color-primary), #9a3412); 
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    font-weight: 800; font-size: 0.8rem; color: white;
                }
                .client-name { font-weight: 600; }

                .concept-tag { 
                    background: rgba(255,255,255,0.06); padding: 4px 10px; border-radius: 6px; 
                    font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.05);
                }

                .method-badge { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 8px; border-radius: 4px; display: inline-block; }
                .method-badge.cash { color: #4ade80; background: rgba(74, 222, 128, 0.1); }
                .method-badge.transfer { color: #60a5fa; background: rgba(96, 165, 250, 0.1); }

                .amount-cell { font-family: 'Outfit', sans-serif; font-weight: 700; color: white; text-align: right; font-size: 1.1rem; }

                .empty-state { text-align: center; padding: 4rem 2rem; }
                .empty-content { display: flex; flex-direction: column; align-items: center; gap: 1rem; color: var(--color-text-muted); }
                .empty-icon { width: 64px; height: 64px; background: rgba(255,255,255,0.03); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; }

                /* Modal */
                .modal-overlay { 
                    position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px);
                    display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem;
                }
                .glass-modal {
                    background: #0f0f0f; border: 1px solid var(--color-border); border-radius: 24px;
                    width: 100%; max-width: 480px; padding: 2.5rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
                    animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                @keyframes modalPop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .modal-header h2 { font-size: 1.5rem; font-weight: 800; margin: 0; }
                .close-btn { background: rgba(255,255,255,0.05); border: none; color: white; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .close-btn:hover { background: rgba(255,255,255,0.1); transform: rotate(90deg); }

                .form-group-stitch { margin-bottom: 1.5rem; position: relative; }
                .form-group-stitch label { display: block; font-size: 0.7rem; font-weight: 800; color: var(--color-text-muted); margin-bottom: 0.6rem; letter-spacing: 0.05em; }
                
                .input-wrapper { position: relative; }
                .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); pointer-events: none; }
                
                .stitch-input, .stitch-select { 
                    width: 100%; background: #1a1a1a; border: 1px solid var(--color-border);
                    padding: 1rem 1rem 1rem 3rem; border-radius: 12px; color: white; font-size: 1rem; transition: all 0.2s;
                }
                .stitch-select { padding-left: 1rem; appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 1em; }
                
                .stitch-input:focus, .stitch-select:focus { border-color: var(--color-primary); outline: none; background: #222; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1); }
                .amount-input { font-size: 1.25rem; font-weight: 700; color: var(--color-primary); }

                .autocomplete-results { 
                    position: absolute; top: calc(100% + 5px); left: 0; right: 0; 
                    background: #1a1a1a; border: 1px solid var(--color-border); border-radius: 12px; 
                    z-index: 10; max-height: 200px; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                .result-item { padding: 0.75rem 1rem; cursor: pointer; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.03); }
                .result-item:hover { background: rgba(255,255,255,0.05); }
                .result-item span { font-weight: 600; }
                .result-item small { color: var(--color-text-muted); }

                .payment-methods-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .method-card { 
                    border: 1px solid var(--color-border); background: rgba(255,255,255,0.02);
                    padding: 1rem; border-radius: 12px; cursor: pointer; text-align: center; transition: all 0.2s;
                }
                .method-card input { display: none; }
                .method-card span { font-weight: 600; font-size: 0.9rem; color: var(--color-text-muted); }
                .method-card.active { border-color: var(--color-primary); background: rgba(249, 115, 22, 0.1); }
                .method-card.active span { color: var(--color-primary); }

                .modal-actions { display: flex; gap: 1rem; margin-top: 2.5rem; }
                .full-width { flex: 1; justify-content: center; }

                @media (max-width: 768px) {
                    .page-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
                    .btn-stitch-primary { width: 100%; justify-content: center; }
                    .stitch-table thead { display: none; }
                    .stitch-table td { display: block; text-align: left; padding: 0.75rem 1.5rem; }
                    .stitch-table tr { border-bottom: 1px solid var(--color-border); display: block; padding: 1rem 0; }
                    .date-cell { flex-direction: row; align-items: center; gap: 0.5rem; }
                    .amount-cell { text-align: left; margin-top: 0.5rem; font-size: 1.25rem; }
                }
            `}</style>
        </div>
    );
};

export default Payments;

