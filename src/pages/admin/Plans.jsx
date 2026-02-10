import React, { useState, useEffect } from 'react';
import { db } from '../../store';
import { Plus, Trash2, Edit2, CheckCircle, X, Save, Clock, DollarSign } from 'lucide-react';

const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPlan, setCurrentPlan] = useState({ id: null, name: '', price: '', durationDays: '' });

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = () => {
        setPlans(db.getPlans());
    };

    const handleSave = (e) => {
        e.preventDefault();
        const planData = {
            name: currentPlan.name,
            price: parseFloat(currentPlan.price),
            durationDays: parseInt(currentPlan.durationDays)
        };

        if (currentPlan.id) {
            db.updatePlan(currentPlan.id, planData);
        } else {
            db.addPlan(planData);
        }

        setIsEditing(false);
        setCurrentPlan({ id: null, name: '', price: '', durationDays: '' });
        loadPlans();
    };

    const handleEdit = (plan) => {
        setCurrentPlan(plan);
        setIsEditing(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de eliminar este plan?')) {
            db.deletePlan(id);
            loadPlans();
        }
    };

    return (
        <div className="plans-view">
            <header className="view-header">
                <div>
                    <h1>Configuración de Planes</h1>
                    <p className="subtitle">Administra las suscripciones disponibles</p>
                </div>
                {!isEditing && (
                    <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                        <Plus size={18} style={{ marginRight: 8 }} /> Nuevo Plan
                    </button>
                )}
            </header>

            <div className="plans-grid">
                {isEditing && (
                    <div className="plan-card glass-card editing">
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Nombre del Plan</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ej. Mensualidad"
                                    value={currentPlan.name}
                                    onChange={e => setCurrentPlan({ ...currentPlan, name: e.target.value })}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Precio ($)</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="0.00"
                                        value={currentPlan.price}
                                        onChange={e => setCurrentPlan({ ...currentPlan, price: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Duración (Días)</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="30"
                                        value={currentPlan.durationDays}
                                        onChange={e => setCurrentPlan({ ...currentPlan, durationDays: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-ghost" onClick={() => { setIsEditing(false); setCurrentPlan({ id: null, name: '', price: '', durationDays: '' }); }}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-success">
                                    <Save size={18} style={{ marginRight: 8 }} /> Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {plans.map(plan => (
                    <div key={plan.id} className="plan-card glass-card">
                        <div className="plan-header">
                            <h3>{plan.name}</h3>
                            <div className="plan-actions">
                                <button className="icon-btn" onClick={() => handleEdit(plan)}><Edit2 size={18} /></button>
                                <button className="icon-btn danger" onClick={() => handleDelete(plan.id)}><Trash2 size={18} /></button>
                            </div>
                        </div>
                        <div className="plan-details">
                            <div className="detail-item">
                                <DollarSign size={16} className="text-accent" />
                                <span>{db.formatCurrency(plan.price)}</span>
                            </div>
                            <div className="detail-item">
                                <Clock size={16} className="text-muted" />
                                <span>{plan.durationDays} días</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .view-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
                .subtitle { color: var(--color-text-muted); font-size: 0.95rem; margin-top: 0.25rem; }

                .plans-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .plan-card {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    transition: all 0.3s;
                    border: 1px solid var(--color-border);
                }
                .plan-card:hover:not(.editing) {
                    border-color: var(--color-accent);
                    transform: translateY(-5px);
                }
                .plan-card.editing {
                    border-color: var(--color-accent);
                    background: rgba(243, 156, 52, 0.05);
                    grid-row: span 2; 
                }

                .plan-header { display: flex; justify-content: space-between; align-items: center; }
                .plan-header h3 { margin: 0; font-size: 1.25rem; }

                .plan-details { display: flex; flex-direction: column; gap: 0.75rem; border-top: 1px solid var(--color-border); padding-top: 1rem; margin-top: auto; }
                .detail-item { display: flex; align-items: center; gap: 0.75rem; font-size: 1rem; font-weight: 500; }
                .text-accent { color: var(--color-accent); }
                .text-muted { color: var(--color-text-muted); }

                .plan-actions { display: flex; gap: 0.5rem; }
                .icon-btn {
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted);
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 6px;
                    transition: all 0.2s;
                }
                .icon-btn:hover { background: rgba(255,255,255,0.1); color: white; }
                .icon-btn.danger:hover { background: rgba(255, 23, 68, 0.1); color: var(--color-danger); }

                .form-group { margin-bottom: 1rem; }
                .form-group label { display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-text-muted); margin-bottom: 0.5rem; text-transform: uppercase; }
                .form-group input { 
                    width: 100%; 
                    padding: 0.75rem 1rem; 
                    background: rgba(0,0,0,0.3); 
                    border: 1px solid var(--color-border); 
                    color: white; 
                    border-radius: 8px; 
                    font-size: 1rem;
                    font-family: inherit;
                }
                .form-group input:focus { border-color: var(--color-accent); outline: none; }
                
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                
                .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
                .btn-ghost { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-muted); }
                .btn-ghost:hover { background: rgba(255,255,255,0.05); color: white; }
                .btn-success { background: var(--color-success); color: #000; border: none; font-weight: 700; }
                .btn-success:hover { filter: brightness(1.1); }

            `}</style>
        </div>
    );
};

export default Plans;
