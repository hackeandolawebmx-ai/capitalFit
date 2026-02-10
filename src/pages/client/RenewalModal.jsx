import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, Building, Smartphone } from 'lucide-react';

const RenewalModal = ({ client, onClose }) => {
    const [selectedMethod, setSelectedMethod] = useState('');
    const [step, setStep] = useState(1);

    const handleConfirm = () => {
        if (selectedMethod === 'whatsapp') {
            const msg = encodeURIComponent(`Hola, soy ${client.name} (ID: ${client.id}). Quiero renovar mi membresía.`);
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
                        <p className="description">Elige tu método de pago preferido para continuar.</p>

                        <div className="payment-options">
                            <button
                                className={`option-card ${selectedMethod === 'counter' ? 'selected' : ''}`}
                                onClick={() => setSelectedMethod('counter')}
                            >
                                <div className="icon"><Building size={24} /></div>
                                <div className="info">
                                    <h4>Pagar en Recepción</h4>
                                    <p>Efectivo o Tarjeta</p>
                                </div>
                                <div className="radio"></div>
                            </button>

                            <button
                                className={`option-card ${selectedMethod === 'transfer' ? 'selected' : ''}`}
                                onClick={() => setSelectedMethod('transfer')}
                            >
                                <div className="icon"><CreditCard size={24} /></div>
                                <div className="info">
                                    <h4>Transferencia</h4>
                                    <p>Envía comprobante</p>
                                </div>
                                <div className="radio"></div>
                            </button>

                            <button
                                className={`option-card ${selectedMethod === 'whatsapp' ? 'selected' : ''}`}
                                onClick={() => setSelectedMethod('whatsapp')}
                            >
                                <div className="icon"><Smartphone size={24} /></div>
                                <div className="info">
                                    <h4>WhatsApp</h4>
                                    <p>Contactar Staff</p>
                                </div>
                                <div className="radio"></div>
                            </button>
                        </div>

                        <button
                            className="confirm-btn"
                            disabled={!selectedMethod}
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

                .payment-options { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
                
                .option-card {
                    display: flex; align-items: center; gap: 1rem; padding: 1.25rem;
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px; width: 100%; text-align: left; cursor: pointer;
                    transition: all 0.2s;
                }
                .option-card:hover { background: rgba(255,255,255,0.05); }
                .option-card.selected { background: rgba(249, 115, 22, 0.1); border-color: var(--color-primary); }

                .option-card .icon { color: #888; }
                .option-card.selected .icon { color: var(--color-primary); }
                
                .option-card .info h4 { margin: 0; font-size: 1rem; font-weight: 700; color: white; }
                .option-card .info p { margin: 0; font-size: 0.8rem; color: #888; }
                
                .option-card .radio {
                    width: 20px; height: 20px; border-radius: 50%; border: 2px solid #555;
                    margin-left: auto; position: relative;
                }
                .option-card.selected .radio { border-color: var(--color-primary); }
                .option-card.selected .radio::after {
                    content: ''; position: absolute; inset: 3px; background: var(--color-primary); border-radius: 50%;
                }

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
