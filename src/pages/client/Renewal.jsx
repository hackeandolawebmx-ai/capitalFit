import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Store, CreditCard, ArrowLeft } from 'lucide-react';

const Renewal = () => {
    const navigate = useNavigate();
    const gymPhone = '5215512345678';

    const handleWhatsApp = () => {
        const msg = encodeURIComponent("Hola, quiero renovar mi membresía en Capital Fit.");
        window.open(`https://wa.me/${gymPhone}?text=${msg}`, '_blank');
    };

    return (
        <div className="renewal-container">
            <div className="renewal-card">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} /> Regresar
                </button>

                <h1>Renovar Membresía</h1>
                <p className="subtitle wellness-studio-text" style={{ fontSize: '0.7rem' }}>SISTEMA DE PAGOS Y RETENCIÓN</p>

                <div className="options-grid">
                    <button className="option-card recommended" onClick={handleWhatsApp}>
                        <div className="badge">Recomendado</div>
                        <Store size={32} />
                        <h3>Pagar en Recepción</h3>
                        <p>Visítanos y paga en efectivo o tarjeta.</p>
                        <span className="cta">Avisar por WhatsApp &rarr;</span>
                    </button>

                    <button className="option-card" onClick={handleWhatsApp}>
                        <CreditCard size={32} />
                        <h3>Transferencia</h3>
                        <p>Te enviamos los datos bancarios.</p>
                        <span className="cta">Pedir datos &rarr;</span>
                    </button>

                    <div className="option-card disabled">
                        <CreditCard size={32} />
                        <h3>Pago en Línea</h3>
                        <p>Próximamente disponible.</p>
                    </div>
                </div>
            </div>
            <style>{`
                .renewal-container {
                    min-height: 100vh;
                    background: var(--color-bg);
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .renewal-card {
                    background: var(--color-card);
                    padding: 2rem;
                    padding-top: 3rem;
                    border-radius: var(--radius-lg);
                    width: 100%;
                    max-width: 600px;
                    position: relative;
                }
                .back-btn {
                    position: absolute;
                    top: 1rem;
                    left: 1rem;
                    background: none;
                    border: none;
                    color: var(--color-text-muted);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }
                h1 { text-align: center; color: var(--color-text); margin-bottom: 0.5rem; }
                .subtitle { text-align: center; color: var(--color-text-muted); margin-bottom: 2rem; }

                .options-grid {
                    display: grid;
                    gap: 1rem;
                    grid-template-columns: 1fr;
                }
                @media(min-width: 600px) {
                    .options-grid { grid-template-columns: 1fr 1fr; }
                }

                .option-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                    color: var(--color-text);
                }
                .option-card:hover:not(.disabled) {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: var(--color-accent);
                    transform: translateY(-2px);
                }
                .option-card svg { margin-bottom: 1rem; color: var(--color-accent); }
                .option-card h3 { font-size: 1.1rem; margin-bottom: 0.5rem; }
                .option-card p { font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 1rem; }
                .cta { font-size: 0.85rem; color: var(--color-accent); font-weight: 600; }

                .recommended { border-color: var(--color-accent); background: rgba(243, 156, 52, 0.05); }
                .badge {
                    position: absolute;
                    top: -10px;
                    background: var(--color-accent);
                    color: #000;
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 10px;
                }
                .disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default Renewal;
