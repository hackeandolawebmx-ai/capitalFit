import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../store';
import { Save, TrendingUp, TrendingDown, Calendar, ArrowLeft, ArrowRight, DollarSign, CreditCard, ShoppingBag, Home, Users, Zap, MoreHorizontal, RotateCcw, Download } from 'lucide-react';
import { format, startOfMonth, addMonths, subMonths, isSameMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    BarChart, Bar, XAxis, Tooltip, ResponsiveContainer
} from 'recharts';

const Rentability = () => {
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
    const [costs, setCosts] = useState({ rent: 0, utilities: 0, staff: 0, other: 0 });
    const [history, setHistory] = useState([]);

    // Month Picker State
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setPickerYear(currentMonth.getFullYear());
    }, [currentMonth]);

    const monthKey = format(currentMonth, 'yyyy-MM');

    useEffect(() => {
        const savedCosts = db.getMonthlyCosts(monthKey);
        setCosts(savedCosts);
        const financialHistory = db.getFinancialHistory(6);
        setHistory(financialHistory);
    }, [currentMonth, monthKey]);

    const [isSaving, setIsSaving] = useState(false);

    const handleSaveCosts = () => {
        setIsSaving(true);
        db.saveMonthlyCosts(monthKey, costs);
        const financialHistory = db.getFinancialHistory(6);
        setHistory(financialHistory);

        // Simulate network delay for UX
        setTimeout(() => setIsSaving(false), 1000);
    };

    const monthlyData = useMemo(() => {
        return db.getMonthlyData(currentMonth);
    }, [currentMonth, history]);

    const navigateMonth = (direction) => {
        setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    };

    const handleMonthSelect = (monthIndex) => {
        const newDate = new Date(pickerYear, monthIndex, 1);
        setCurrentMonth(newDate);
        setIsPickerOpen(false);
    };

    const months = Array.from({ length: 12 }, (_, i) => {
        return format(new Date(2024, i, 1), 'MMM', { locale: es });
    });

    const target = 20000; // Example target
    // Clamp progress between 0 and 100 for the visual circle to prevent breaking styling
    const rawProgress = (monthlyData.profit / target) * 100;
    const visualProgress = Math.max(0, Math.min(rawProgress, 100));
    const displayProgress = Math.round(Math.max(0, rawProgress));

    // Circle configuration
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (visualProgress / 100) * circumference;

    return (
        <div className="rentability-stitch fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%', paddingBottom: '2rem' }}>
            <header className="stitch-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 font-brand normal-case" style={{ textTransform: 'none' }}>
                        Rentabilidad Mensual
                    </h1>
                    <p className="subtitle" style={{ color: '#999', fontSize: '0.95rem', fontWeight: 500 }}>
                        Resumen financiero para <span style={{ color: '#FF9F1C', fontWeight: 600 }} className="capitalize font-brand">{format(currentMonth, 'MMMM yyyy', { locale: es })}</span>
                    </p>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="join relative shadow-lg" style={{ display: 'flex', background: '#111', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
                        <button className="btn btn-ghost join-item px-3 hover:bg-white/10 text-white" onClick={() => navigateMonth('prev')} title="Mes Anterior" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                            <ArrowLeft size={18} />
                        </button>

                        <div className="relative">
                            <button
                                className="btn btn-ghost join-item px-5 font-bold min-w-[140px] text-lg font-brand text-white hover:bg-white/10"
                                onClick={() => setIsPickerOpen(!isPickerOpen)}
                                title="Seleccionar Mes"
                                style={{ borderRight: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'white', border: 'none', height: '100%', borderRadius: 0 }}
                            >
                                <span className="capitalize">{format(currentMonth, 'MMM yyyy', { locale: es })}</span>
                            </button>

                            {isPickerOpen && (
                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-[#333] rounded-2xl p-4 shadow-2xl z-50 w-72 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#333]">
                                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white" onClick={() => setPickerYear(y => y - 1)}>
                                            <ArrowLeft size={16} />
                                        </button>
                                        <span className="font-bold text-xl font-brand text-white">{pickerYear}</span>
                                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white" onClick={() => setPickerYear(y => y + 1)}>
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {months.map((m, i) => {
                                            const isSelected = currentMonth.getMonth() === i && currentMonth.getFullYear() === pickerYear;
                                            return (
                                                <button
                                                    key={i}
                                                    className={`p-2.5 text-sm rounded-lg transition-all capitalize font-medium ${isSelected ? 'bg-primary text-black font-bold shadow-lg shadow-orange-500/20' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                                                    onClick={() => handleMonthSelect(i)}
                                                >
                                                    {m}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="fixed inset-0 z-[-1]" onClick={() => setIsPickerOpen(false)}></div>
                                </div>
                            )}
                        </div>

                        <button className="btn btn-ghost join-item px-3 hover:bg-white/10 text-white" onClick={() => navigateMonth('next')} title="Mes Siguiente" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                            <ArrowRight size={18} />
                        </button>

                        {!isSameMonth(currentMonth, new Date()) && (
                            <button className="btn btn-ghost join-item text-primary hover:bg-white/10" onClick={() => setCurrentMonth(startOfMonth(new Date()))} title="Regresar al mes actual">
                                <RotateCcw size={18} />
                            </button>
                        )}
                    </div>
                    <button className="btn btn-primary shadow-lg shadow-orange-500/20 text-black font-bold normal-case text-base px-6 rounded-xl" onClick={() => window.print()} style={{ textTransform: 'none' }}>
                        <Download size={18} className="mr-2" /> Exportar PDF
                    </button>
                </div>
            </header>

            <div className="top-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {/* Financial Health Status */}
                <div
                    className="card-health"
                    style={{
                        gridColumn: 'span 2',
                        background: '#0a0a0a',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        overflow: 'hidden'
                    }}
                >
                    {/* Left Side: Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '65%' }}>
                        <h3 style={{
                            color: 'white',
                            fontSize: '1.125rem',
                            fontWeight: 700,
                            fontFamily: "'Outfit', sans-serif",
                            marginBottom: '0.5rem',
                            textTransform: 'none',
                            letterSpacing: 'normal'
                        }}>
                            Salud Financiera
                        </h3>
                        <p style={{
                            color: '#9CA3AF',
                            fontSize: '0.875rem',
                            lineHeight: '1.5',
                            fontWeight: 500,
                            marginBottom: '1.5rem',
                            fontFamily: "'Outfit', sans-serif"
                        }}>
                            Tu estudio está rindiendo un 12% mejor que el mes anterior.
                        </p>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: 'rgba(20, 83, 45, 1)',
                            color: '#4ade80',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            width: 'fit-content',
                            boxShadow: '0 0 10px rgba(20, 83, 45, 0.4)',
                            border: '1px solid rgba(74, 222, 128, 0.2)'
                        }}>
                            <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#4ade80',
                                boxShadow: '0 0 6px #4ade80'
                            }}></span>
                            BUEN CAMINO
                        </div>
                    </div>

                    {/* Right Side: Chart */}
                    <div style={{ width: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ position: 'relative', width: '128px', height: '128px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} viewBox="0 0 160 160">
                                <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#222" strokeWidth="12" />
                                <circle
                                    cx="80" cy="80" r={radius}
                                    fill="transparent"
                                    stroke="#FF9F1C"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '1.875rem', fontWeight: 700, color: 'white', fontFamily: "'Outfit', sans-serif" }}>
                                    {displayProgress}%
                                </span>
                                <span style={{ fontSize: '0.625rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Outfit', sans-serif" }}>
                                    META
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Net Profit Card */}
                <div style={{
                    backgroundColor: '#FF9F1C',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '200px',
                    boxShadow: '0 20px 40px rgba(255, 159, 28, 0.25)'
                }}>
                    <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', fontWeight: 500, fontFamily: "'Outfit', sans-serif", marginBottom: '0.25rem' }}>
                                Utilidad Neta Estimada
                            </p>
                            <h3 style={{
                                fontSize: '3.5rem',
                                fontWeight: 700,
                                lineHeight: 1,
                                fontFamily: "'Outfit', sans-serif",
                                letterSpacing: '-0.02em',
                                margin: '0.5rem 0 1rem 0'
                            }}>
                                {db.formatCurrency(monthlyData.profit)}
                            </h3>
                        </div>

                        <div>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(4px)',
                                padding: '0.375rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'white'
                            }}>
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '50%', padding: '2px', display: 'flex' }}>
                                    <TrendingUp size={10} color="white" strokeWidth={3} />
                                </div>
                                <span>+8.5% vs mes anterior</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ position: 'absolute', right: '-3rem', bottom: '-3rem', width: '12rem', height: '12rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }}></div>
                </div>
            </div>

            <div className="main-grid">
                {/* Income Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h4 className="section-title text-success"><TrendingUp size={20} /> INGRESOS MENSUALES</h4>
                        <span className="badge success-soft border border-green-500/20 font-brand text-sm">Total: {db.formatCurrency(monthlyData.income)}</span>
                    </div>
                    <div className="card-stitch overflow-hidden border-t-4 border-t-success">
                        <table className="table-clean">
                            <thead>
                                <tr>
                                    <th>FUENTE DE INGRESOS</th>
                                    <th className="text-right">MONTO</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="group hover:bg-white/[0.02] transition-colors">
                                    <td>
                                        <div className="flex items-center gap-4">
                                            <div className="icon-box success shadow-lg shadow-green-900/20 group-hover:scale-110 transition-transform"><CreditCard size={22} /></div>
                                            <div>
                                                <p className="font-bold text-base text-white font-brand">Membresías</p>
                                                <p className="text-muted text-xs font-medium">324 Miembros activos</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-right font-black text-xl text-white font-brand">{db.formatCurrency(monthlyData.income)}</td>
                                </tr>
                                <tr className="group hover:bg-white/[0.02] transition-colors">
                                    <td>
                                        <div className="flex items-center gap-4">
                                            <div className="icon-box success shadow-lg shadow-green-900/20 group-hover:scale-110 transition-transform"><Users size={22} /></div>
                                            <div>
                                                <p className="font-bold text-base text-white font-brand">Entrenamientos Personales</p>
                                                <p className="text-muted text-xs font-medium">Sesiones privadas</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-right font-black text-xl text-white opacity-50 font-brand">$0.00</td>
                                </tr>
                                <tr className="group hover:bg-white/[0.02] transition-colors">
                                    <td>
                                        <div className="flex items-center gap-4">
                                            <div className="icon-box success shadow-lg shadow-green-900/20 group-hover:scale-110 transition-transform"><ShoppingBag size={22} /></div>
                                            <div>
                                                <p className="font-bold text-base text-white font-brand">Tienda / Suplementos</p>
                                                <p className="text-muted text-xs font-medium">Venta directa</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-right font-black text-xl text-white opacity-50 font-brand">$0.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Fixed Costs Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h4 className="section-title text-danger"><TrendingDown size={20} /> COSTOS FIJOS</h4>
                        <span className="badge danger-soft border border-red-500/20 font-brand text-sm">Total: {db.formatCurrency(monthlyData.totalCosts)}</span>
                    </div>
                    <div className="card-stitch overflow-hidden border-t-4 border-t-danger">
                        <table className="table-clean">
                            <thead>
                                <tr>
                                    <th>CATEGORÍA DE GASTO</th>
                                    <th className="text-right">MONTO</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="group hover:bg-white/[0.02] transition-colors">
                                    <td>
                                        <div className="flex items-center gap-4">
                                            <div className="icon-box danger shadow-lg shadow-red-900/20 group-hover:scale-110 transition-transform"><Home size={22} /></div>
                                            <div>
                                                <p className="font-bold text-base text-white font-brand">Renta del Local</p>
                                                <p className="text-muted text-xs font-medium">Instalación principal + I.V.A.</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <div className="input-group">
                                            <span className="currency-symbol">$</span>
                                            <input type="number" className="input-inline font-brand text-lg" value={costs.rent} onChange={e => setCosts({ ...costs, rent: parseInt(e.target.value) || 0 })} />
                                        </div>
                                    </td>
                                </tr>
                                <tr className="group hover:bg-white/[0.02] transition-colors">
                                    <td>
                                        <div className="flex items-center gap-4">
                                            <div className="icon-box danger shadow-lg shadow-red-900/20 group-hover:scale-110 transition-transform"><Users size={22} /></div>
                                            <div>
                                                <p className="font-bold text-base text-white font-brand">Nómina / Staff</p>
                                                <p className="text-muted text-xs font-medium">8 Empleados</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <div className="input-group">
                                            <span className="currency-symbol">$</span>
                                            <input type="number" className="input-inline font-brand text-lg" value={costs.staff} onChange={e => setCosts({ ...costs, staff: parseInt(e.target.value) || 0 })} />
                                        </div>
                                    </td>
                                </tr>
                                <tr className="group hover:bg-white/[0.02] transition-colors">
                                    <td>
                                        <div className="flex items-center gap-4">
                                            <div className="icon-box danger shadow-lg shadow-red-900/20 group-hover:scale-110 transition-transform"><Zap size={22} /></div>
                                            <div>
                                                <p className="font-bold text-base text-white font-brand">Servicios</p>
                                                <p className="text-muted text-xs font-medium">Electricidad, Agua, Internet</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <div className="input-group">
                                            <span className="currency-symbol">$</span>
                                            <input type="number" className="input-inline font-brand text-lg" value={costs.utilities} onChange={e => setCosts({ ...costs, utilities: parseInt(e.target.value) || 0 })} />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="p-4 border-t border-border bg-[#151515] flex justify-end">
                            <button className="btn btn-sm btn-primary min-w-[160px]" onClick={handleSaveCosts} disabled={isSaving}>
                                {isSaving ? <MoreHorizontal size={16} className="animate-spin" /> : <Save size={16} />}
                                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            <div className="bottom-grid">
                {/* UPCOMING RENEWALS CARD - REFINED MATCHING PHOTO 2 */}
                <div className="card-stitch p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="text-xs font-bold tracking-[0.15em] text-[#999] font-brand uppercase">Próximas Renovaciones</h5>
                        <button className="text-muted hover:text-white transition-colors"><MoreHorizontal size={18} /></button>
                    </div>
                    <div className="space-y-4 flex-grow">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white font-medium font-brand text-[0.95rem]">Licencia CRM Software</span>
                                <span className="font-bold text-white font-brand">$199.00</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white font-medium font-brand text-[0.95rem]">Seguro Responsabilidad</span>
                                <span className="font-bold text-white font-brand">$850.00</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="progress-bar mb-3">
                                <div className="progress-fill shadow-lg shadow-orange-500/40" style={{ width: '45%' }}></div>
                            </div>
                            <p className="text-xs text-[#666] font-medium font-brand">
                                Gasto mensual estimado en software/legal: <span className="text-[#888]">$1,049</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* MONTHLY TREND CARD - REFINED MATCHING PHOTO 2 */}
                <div className="card-stitch p-8 col-span-2 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h5 className="text-xs font-bold tracking-[0.2em] text-[#999] font-brand uppercase mb-2">Tendencia Mensual</h5>
                            <p className="text-2xl font-bold text-white font-brand">Historial de Utilidad Neta</p>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#FF9F1C]"></span>
                                <span className="text-xs font-bold text-[#999] tracking-wider uppercase font-brand">Actual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#333]"></span>
                                <span className="text-xs font-bold text-[#999] tracking-wider uppercase font-brand">Año Pasado</span>
                            </div>
                        </div>
                    </div>
                    {/* WIDE BAR CHART */}
                    <div className="chart-container relative z-10" style={{ height: '280px' }}>
                        <ResponsiveContainer>
                            <BarChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={60}>
                                <Bar
                                    dataKey="utilidad"
                                    fill="#FF9F1C"
                                    radius={[6, 6, 0, 0]}
                                    activeBar={{ fill: '#ffad42' }}
                                />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#666', fontWeight: 600, dy: 15, fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase' }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', fontFamily: "'Outfit', sans-serif" }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    formatter={(value) => [db.formatCurrency(value), 'Utilidad']}
                                    labelStyle={{ color: '#999', marginBottom: '0.5rem', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <style>{`
                .rentability-stitch { display: flex; flex-direction: column; gap: 2rem; max-width: 1400px; margin: 0 auto; color: white; width: 100%; padding-bottom: 2rem; }
                
                .font-brand { font-family: var(--font-brand); }
                
                .stitch-header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); flex-wrap: wrap; gap: 1rem; }
                .subtitle { color: var(--color-text-muted); font-size: 0.95rem; margin-top: 0.25rem; font-weight: 500; font-family: var(--font-brand); letter-spacing: 0.02em; }

                .top-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
                .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .bottom-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; }

                .card-stitch { 
                    background: #111; 
                    border: 1px solid rgba(255,255,255,0.08); 
                    border-radius: 20px; 
                    display: flex; 
                    flex-direction: column; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                    transition: all 0.3s ease;
                }
                
                .card-stitch:hover {
                    border-color: rgba(255,255,255,0.15);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                }

                .section-title { font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-family: var(--font-brand); }

                .table-clean { width: 100%; border-collapse: collapse; }
                .table-clean th { text-align: left; padding: 1.25rem 1.5rem; font-size: 0.7rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; background: rgba(255,255,255,0.02); font-family: var(--font-brand); }
                .table-clean td { padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.95rem; }
                .table-clean tr:last-child td { border-bottom: none; }

                .icon-box { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .icon-box.success { background: rgba(16, 185, 129, 0.15); color: #00E676; border: 1px solid rgba(16, 185, 129, 0.2); }
                .icon-box.danger { background: rgba(239, 68, 68, 0.15); color: #FF1744; border: 1px solid rgba(239, 68, 68, 0.2); }

                .badge { padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.05em; display: inline-flex; align-items: center; font-family: var(--font-brand); }
                .badge.success-soft { background: rgba(0, 230, 118, 0.1); color: #00E676; }
                .badge.danger-soft { background: rgba(255, 23, 68, 0.1); color: #FF1744; }

                .input-group { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
                .currency-symbol { color: var(--color-text-muted); font-size: 1.1rem; font-weight: 600; font-family: var(--font-brand); }
                .input-inline { 
                    background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px; color: white; text-align: right; font-weight: bold; font-family: var(--font-brand);
                    width: 150px; padding: 0.75rem 1rem; transition: all 0.2s; font-size: 1.1rem;
                }
                .input-inline:focus { outline: none; border-color: var(--color-primary); background: rgba(0,0,0,0.5); box-shadow: 0 0 0 4px rgba(243, 156, 52, 0.1); }

                .progress-bar { height: 6px; background: rgba(255,255,255,0.08); border-radius: 100px; overflow: hidden; }
                .progress-fill { height: 100%; background: var(--color-primary); border-radius: 100px; }

                .join { display: flex; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; overflow: hidden; background: #1a1a1a; }
                .join-item { border: none !important; border-right: 1px solid rgba(255,255,255,0.1) !important; border-radius: 0 !important; width: auto !important; height: 100%; }
                .join-item:last-child { border-right: none !important; }
                .join-item:hover { background: rgba(255,255,255,0.05); }

                @media (max-width: 1024px) {
                    .top-grid, .main-grid, .bottom-grid { grid-template-columns: 1fr; }
                    .card-stitch.col-span-2 { grid-column: auto; }
                    .chart-container { height: 200px; }
                }
            `}</style>
        </div>
    );
};

export default Rentability;
