import React, { useState } from 'react';
import { db } from '../../store';
import { X, CheckCircle, CreditCard, Building, Smartphone, Calendar } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

const RenewalModal = ({ client, onClose }) => {
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('');
    const [step, setStep] = useState(1);
    const [filteredPlans, setFilteredPlans] = useState([]);

    React.useEffect(() => {
        const allPlans = db.getPlans();
        if (client && client.birthDate) {
            const age = differenceInDays(new Date(), parseISO(client.birthDate)) / 365;
            const isMinor = age < 18;
            const isFemale = client.gender === 'female';
            const isMale = client.gender === 'male';

            const relevant = allPlans.filter(p => {
                // Always exclude Visits/Inscriptions from generic renewal prompt for now, or keep them?
                // Renewal usually implies monthly plan.
                if (p.name.includes('INSCRIPCION') || p.name.includes('VISITA')) return false;

                if (isMinor) return p.name.includes('TEENS');
                if (isFemale) return p.name.includes('POWERFUL');
                if (isMale) return p.name.includes('MUSCLE');
                return !p.name.includes('TEENS'); // Fallback
            });
            setFilteredPlans(relevant);

            // Auto-select if only one option
            if (relevant.length === 1) setSelectedPlanId(relevant[0].id);
        }
    }, [client]);

    const handleConfirm = () => {
        const plan = filteredPlans.find(p => p.id === selectedPlanId);
        const planName = plan ? plan.name : 'Plan';

        if (selectedMethod === 'whatsapp') {
            const msg = encodeURIComponent(`Hola, soy ${client.name} (ID: ${client.id}). Quiero renovar mi membresía con el plan: ${planName}.`);
            window.open(`https://wa.me/5215512345678?text=${msg}`, '_blank');
            setStep(2);
        } else {
            // Placeholder for other methods
            setStep(2);
        }
    };

    return (
        <div className="renewal-overlay">
            <div className={`renewal-modal ${step === 2 ? 'success-mode' : ''}`}>
                <button className="close-btn" onClick={onClose}><X size={24} /></button>

                {step === 1 ? (
                    <>
                        <h2>Renovar Membresía</h2>
                        <p className="description">Selecciona tu plan y método de pago ideal.</p>

                        <div className="form-group mb-6">
                            <label className="text-xs font-bold text-gray-500 mb-2 block">PLAN SUGERIDO</label>
                            <div className="flex flex-col gap-2">
                                {filteredPlans.map(p => (
                                    <button
                                        key={p.id}
                                        className={`plan-card ${selectedPlanId === p.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedPlanId(p.id)}
                                    >
                                        <div className="flex justify-between w-full items-center">
                                            <div className="text-left">
                                                <h4 className="font-bold text-white">{p.name}</h4>
                                                <p className="text-xs text-gray-400">{p.durationDays} Días</p>
                                            </div>
                                            <div className="font-bold text-primary">{db.formatCurrency(p.price)}</div>
                                        </div>
                                        {selectedPlanId === p.id && <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="text-xs font-bold text-gray-500 mb-2 block">MÉTODO DE PAGO</label>
                            <div className="payment-options">
                                <button
                                    className={`option-card ${selectedMethod === 'counter' ? 'selected' : ''}`}
                                    onClick={() => setSelectedMethod('counter')}
                                >
                                    <div className="icon"><Building size={20} /></div>
                                    <div className="info">
                                        <h4>Recepción</h4>
                                    </div>
                                </button>

                                <button
                                    className={`option-card ${selectedMethod === 'transfer' ? 'selected' : ''}`}
                                    onClick={() => setSelectedMethod('transfer')}
                                >
                                    <div className="icon"><CreditCard size={20} /></div>
                                    <div className="info">
                                        <h4>Transferencia</h4>
                                    </div>
                                </button>

                                <button
                                    className={`option-card ${selectedMethod === 'whatsapp' ? 'selected' : ''}`}
                                    onClick={() => setSelectedMethod('whatsapp')}
                                >
                                    <div className="icon"><Smartphone size={20} /></div>
                                    <div className="info">
                                        <h4>WhatsApp</h4>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <button
                            className="confirm-btn"
                            disabled={!selectedMethod || !selectedPlanId}
                            onClick={handleConfirm}
                        >
                            Continuar
                        </button>
                    </>
                ) : (
                    <div className="success-content">
                        <div className="success-icon">
                            <CheckCircle size={48} />
                        </div>
                        <h2>¡Solicitud Enviada!</h2>
                        <p>Acércate a recepción o espera confirmación por mensaje para completar tu renovación.</p>
                        <button className="confirm-btn" onClick={onClose}>Entendido</button>
                    </div>
                )}
            </div>

            <style>{`
                .renewal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
                    display: flex; align-items: flex-end; justify-content: center; z-index: 50;
                    opacity: 0; animation: fadeIn 0.3s forwards;
                }
                @media (min-width: 768px) { .renewal-overlay { align-items: center; } }

                .renewal-modal {
                    background: #111; border: 1px solid #333; border-radius: 24px 24px 0 0;
                    width: 100%; max-width: 500px; padding: 2rem; position: relative;
                    transform: translateY(100%); animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @media (min-width: 768px) { .renewal-modal { border-radius: 24px; transform: scale(0.9); animation: modalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; } }

                .close-btn { 
                    position: absolute; top: 1.5rem; right: 1.5rem; background: rgba(255,255,255,0.1); 
                    border: none; color: white; width: 32px; height: 32px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center; cursor: pointer;
                }

                h2 { margin: 0 0 0.5rem; font-size: 1.5rem; font-weight: 800; }
                .description { color: #888; font-size: 0.9rem; margin-bottom: 2rem; }

                .payment-options { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-bottom: 0; }
                
                .plan-card {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
                    padding: 1rem; border-radius: 12px; cursor: pointer; position: relative;
                    transition: all 0.2s;
                }
                .plan-card:hover { background: rgba(255,255,255,0.05); }
                .plan-card.selected { background: rgba(249, 115, 22, 0.1); border-color: var(--color-primary); }

                .option-card {
                    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; padding: 1rem;
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px; width: 100%; text-align: center; cursor: pointer;
                    transition: all 0.2s; aspect-ratio: 1;
                }
                .option-card:hover { background: rgba(255,255,255,0.05); }
                .option-card.selected { background: rgba(249, 115, 22, 0.1); border-color: var(--color-primary); }

                .option-card .icon { color: #888; }
                .option-card.selected .icon { color: var(--color-primary); }
                
                .option-card .info h4 { margin: 0; font-size: 0.75rem; font-weight: 700; color: white; }

                .confirm-btn {
                    width: 100%; background: var(--color-primary); color: white; border: none;
                    padding: 1rem; border-radius: 12px; font-weight: 800; font-size: 1rem;
                    cursor: pointer; transition: 0.2s;
                }
                .confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .confirm-btn:hover:not(:disabled) { box-shadow: 0 10px 20px rgba(249, 115, 22, 0.3); transform: translateY(-2px); }

                .success-content { text-align: center; padding: 2rem 0; }
                .success-icon { color: #10B981; margin-bottom: 1.5rem; display: inline-block; }
                
                @keyframes fadeIn { to { opacity: 1; } }
                @keyframes slideUp { to { transform: translateY(0); } }
                @keyframes modalPop { to { transform: scale(1); } }
            `}</style>
        </div>
    );
};

export default RenewalModal;
