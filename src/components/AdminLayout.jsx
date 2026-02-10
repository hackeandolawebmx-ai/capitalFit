import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, PieChart, Zap } from 'lucide-react';

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-logo" style={{ alignItems: 'flex-start' }}>
                        <h2 className="brand-title">CAPITAL FIT</h2>
                        <span className="wellness-studio-text">WELLNESS STUDIO</span>
                        <div className="brand-bolt" style={{ marginTop: '0.25rem' }}>
                            <Zap size={24} fill="currentColor" />
                        </div>
                    </div>
                </div>
                <nav>
                    <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/clientes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Users size={20} />
                        <span>Clientes</span>
                    </NavLink>
                    <NavLink to="/admin/pagos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <CreditCard size={20} />
                        <span>Pagos</span>
                    </NavLink>
                    <NavLink to="/admin/rentabilidad" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <PieChart size={20} />
                        <span>Rentabilidad</span>
                    </NavLink>
                    <NavLink to="/admin/planes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Zap size={20} />
                        <span>Planes</span>
                    </NavLink>
                </nav>
                <div className="user-profile">
                    <div className="avatar">O</div>
                    <div className="info">
                        <p>Owner</p>
                        <small>Capital Fit</small>
                    </div>
                </div>
            </aside>
            <main className="content">
                <header className="mobile-header">
                    <h3>Panel de Control</h3>
                </header>
                <div className="page-container">
                    <Outlet />
                </div>
            </main>
            <style>{`
                .admin-layout {
                    display: flex;
                    min-height: 100vh;
                    background: radial-gradient(circle at top right, #111, #000);
                    color: var(--color-text);
                    animation: fadeIn 0.8s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .sidebar {
                    width: 280px;
                    background: rgba(10, 10, 10, 0.6);
                    backdrop-filter: blur(20px);
                    border-right: 1px solid var(--color-border);
                    display: flex;
                    flex-direction: column;
                    padding: 2rem 1.5rem;
                    position: sticky;
                    top: 0;
                    height: 100vh;
                    z-index: 100;
                }
                .brand {
                    margin-bottom: 3rem;
                    padding-left: 0.5rem;
                }
                .brand-title {
                    font-size: 1.4rem;
                    margin: 0;
                    background: linear-gradient(to right, var(--color-text), var(--color-accent));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                nav { display: flex; flex-direction: column; gap: 0.75rem; flex: 1; }
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.85rem 1.25rem;
                    border-radius: var(--radius-md);
                    color: var(--color-text-muted);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 0.95rem;
                    border: 1px solid transparent;
                }
                .nav-item:hover {
                    background: rgba(255, 255, 255, 0.03);
                    color: var(--color-text);
                    transform: translateX(4px);
                }
                .nav-item.active {
                    background: var(--color-accent);
                    color: #000;
                    font-weight: 700;
                    box-shadow: var(--shadow-accent);
                }
                .nav-item svg { transition: transform 0.3s; }
                .nav-item.active svg { transform: scale(1.1); }
                
                .content {
                    flex: 1;
                    width: 100%;
                    min-width: 0;
                }
                .page-container {
                    padding: 2rem;
                    max-width: 1600px;
                    margin: 0 auto;
                    width: 100%;
                }
                .mobile-header { display: none; }
                .user-profile {
                    margin-top: auto;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.5rem;
                    background: rgba(255,255,255,0.02);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--color-border);
                }
                .avatar {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, var(--color-accent), #E67E22);
                    color: #000;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    box-shadow: 0 4px 10px rgba(243, 156, 52, 0.3);
                }
                .info p { font-size: 0.9rem; font-weight: 600; margin:0; }
                .info small { color: var(--color-text-muted); font-size: 0.75rem; }

                @media (max-width: 900px) {
                    .admin-layout { flex-direction: column !important; padding-bottom: 70px; }
                    .sidebar { 
                        width: 100% !important; 
                        height: 70px !important; 
                        min-height: 0 !important;
                        position: fixed !important;
                        bottom: 0 !important;
                        top: auto !important;
                        flex-direction: row !important;
                        padding: 0 !important;
                        justify-content: space-around !important;
                        background: rgba(10, 10, 10, 0.85) !important;
                        backdrop-filter: blur(25px) !important;
                        border-right: none !important;
                        border-top: 1px solid var(--color-border) !important;
                        z-index: 1000 !important;
                        border-radius: 20px 20px 0 0 !important;
                    }
                    .brand, .user-profile, .brand-bolt { display: none !important; }
                    nav { 
                        flex-direction: row !important; 
                        gap: 0 !important;
                        flex: 1 !important;
                        justify-content: space-around !important;
                        align-items: center !important;
                    }
                    .nav-item { 
                        padding: 0.5rem !important; 
                        flex-direction: column !important;
                        gap: 0.25rem !important;
                        flex: 1 !important;
                        height: 100% !important;
                        justify-content: center !important;
                        border-radius: 0 !important;
                        background: transparent !important;
                        border: none !important;
                    }
                    .nav-item:hover { transform: none !important; }
                    .nav-item span { 
                        display: block !important; 
                        font-size: 0.65rem !important;
                        text-transform: uppercase !important;
                        letter-spacing: 0.05em !important;
                    }
                    .nav-item.active {
                        color: var(--color-accent) !important;
                        background: transparent !important;
                        box-shadow: none !important;
                    }
                    .nav-item.active svg {
                        filter: drop-shadow(0 0 5px var(--color-border-glow));
                    }
                    .page-container { padding: 1.5rem !important; }
                }
                
                @media (max-width: 480px) {
                    .page-container { padding: 1rem !important; }
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
