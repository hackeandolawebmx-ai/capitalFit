import { v4 as uuidv4 } from 'uuid';
import { addDays, isPast, differenceInDays, parseISO, isAfter, format } from 'date-fns';

const STORAGE_KEYS = {
  CLIENTS: 'capitalfit_clients',
  PAYMENTS: 'capitalfit_payments',
  PLANS: 'capitalfit_plans_2026',
  SETTINGS: 'capitalfit_settings',
  MONTHLY_COSTS: 'capitalfit_monthly_costs'
};

// Initial Mock Data
const INITIAL_PLANS = [
  { id: 'p1', name: 'POWERFUL LADIES', price: 2400, durationDays: 30 },
  { id: 'p2', name: 'MUSCLE MEN', price: 2600, durationDays: 30 },
  { id: 'p3', name: 'TEENS (HASTA 18 AÑOS)', price: 1900, durationDays: 30 },
  { id: 'p4', name: 'INSCRIPCION', price: 1100, durationDays: 0 }, // 0 implies one-time fee/no duration ext
  { id: 'p5', name: 'RE-INSCRIPCION', price: 600, durationDays: 0 },
  { id: 'p6', name: 'VISITA', price: 150, durationDays: 1 },
];

const INITIAL_CLIENTS = [
  {
    id: 'c1',
    name: 'Juan Pérez',
    phone: '5512345678',
    birthDate: '1990-05-15',
    gender: 'male',
    activePlanId: 'p1',
    expirationDate: addDays(new Date(), 1).toISOString(), // Upcoming (1 day)
    lastPaymentDate: new Date().toISOString()
  },
  {
    id: 'c2',
    name: 'María García',
    phone: '5587654321',
    birthDate: '1995-10-20',
    gender: 'female',
    activePlanId: 'p1',
    expirationDate: addDays(new Date(), -3).toISOString(), // Risk (3 days ago)
    lastPaymentDate: addDays(new Date(), -33).toISOString()
  },
  {
    id: 'c3',
    name: 'Carlos López',
    phone: '5511223344',
    birthDate: '1988-03-10',
    gender: 'male',
    activePlanId: 'p1',
    expirationDate: addDays(new Date(), -10).toISOString(), // Expired
    lastPaymentDate: addDays(new Date(), -40).toISOString()
  },
  {
    id: 'c4',
    name: 'Ana Torres',
    phone: '5555666777',
    birthDate: '2000-01-01',
    gender: 'female',
    activePlanId: 'p1',
    expirationDate: addDays(new Date(), -20).toISOString(), // Expired
    lastPaymentDate: addDays(new Date(), -50).toISOString()
  }
];

export const db = {
  // --- Helpers ---
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.PLANS)) {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(INITIAL_PLANS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
    }
  },

  // --- Clients ---
  getClients: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]');
  },

  getClientByPhone: (phone) => {
    const clients = db.getClients();
    return clients.find(c => c.phone === phone);
  },

  getClientById: (id) => {
    const clients = db.getClients();
    return clients.find(c => c.id === id);
  },

  addClient: (clientData) => {
    const clients = db.getClients();
    const newClient = { ...clientData, id: uuidv4() };
    clients.push(newClient);
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    return newClient;
  },

  updateClient: (id, data) => {
    const clients = db.getClients();
    const index = clients.findIndex(c => c.id === id);
    if (index !== -1) {
      clients[index] = { ...clients[index], ...data };
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    }
  },

  // --- Biometrics ---
  addBiometric: (clientId, data) => {
    const clients = db.getClients();
    const clientIndex = clients.findIndex(c => c.id === clientId);

    if (clientIndex !== -1) {
      const client = clients[clientIndex];
      if (!client.biometrics) {
        client.biometrics = [];
      }

      const newEntry = {
        id: uuidv4(),
        date: new Date().toISOString(),
        ...data
      };

      client.biometrics.push(newEntry);

      // Update client with new biometrics array
      clients[clientIndex] = client;
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
      return newEntry;
    }
    return null;
  },

  getBiometrics: (clientId) => {
    const client = db.getClientById(clientId);
    return client && client.biometrics ? client.biometrics.sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
  },

  getClientStatus: (client) => {
    if (!client.expirationDate) return 'expired';

    const now = new Date();
    const exp = parseISO(client.expirationDate);

    // Active: Exp date is in the future or today
    if (isAfter(exp, addDays(now, -1))) { // Valid until end of day
      // Check exact comparison logic. Usually expiration is at end of day.
      // Assuming strictly > now.
      if (exp >= now) return 'active';
    }

    const daysOverdue = differenceInDays(now, exp);

    if (daysOverdue <= 0) return 'active'; // Should be covered above
    if (daysOverdue <= 7) return 'risk';
    return 'expired';
  },

  // --- Plans ---
  getPlans: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANS) || '[]');
  },

  addPlan: (planData) => {
    const plans = db.getPlans();
    const newPlan = { ...planData, id: uuidv4() };
    plans.push(newPlan);
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    return newPlan;
  },

  updatePlan: (id, data) => {
    const plans = db.getPlans();
    const index = plans.findIndex(p => p.id === id);
    if (index !== -1) {
      plans[index] = { ...plans[index], ...data };
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    }
  },

  deletePlan: (id) => {
    const plans = db.getPlans().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  },

  // --- Payments ---
  getPayments: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
  },

  addPayment: (paymentData) => {
    const payments = db.getPayments();
    const newPayment = { ...paymentData, id: uuidv4(), date: new Date().toISOString() };
    payments.push(newPayment);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

    // Update client expiration
    const client = db.getClients().find(c => c.id === paymentData.clientId);
    if (client) {
      // Calculate new expiration
      // Logic: If active, add to expiration? Or starts from today?
      // Simple rule: Starts from today if expired, or adds to current expiration if active.
      const plan = db.getPlans().find(p => p.id === paymentData.planId);
      if (plan) {
        let newExp;
        const currentExp = client.expirationDate ? parseISO(client.expirationDate) : new Date();
        const now = new Date();

        if (isAfter(currentExp, now)) {
          newExp = addDays(currentExp, plan.durationDays);
        } else {
          newExp = addDays(now, plan.durationDays);
        }

        db.updateClient(client.id, {
          expirationDate: newExp.toISOString(),
          activePlanId: plan.id,
          lastPaymentDate: newPayment.date
        });
      }
    }
    return newPayment;
  },

  // --- Rentability / Analytics ---
  getMonthlyCosts: (monthKey) => {
    // monthKey format: 'YYYY-MM'
    const allCosts = JSON.parse(localStorage.getItem(STORAGE_KEYS.MONTHLY_COSTS) || '{}');
    return allCosts[monthKey] || { rent: 0, utilities: 0, staff: 0, other: 0 };
  },

  saveMonthlyCosts: (monthKey, costs) => {
    const allCosts = JSON.parse(localStorage.getItem(STORAGE_KEYS.MONTHLY_COSTS) || '{}');
    allCosts[monthKey] = costs;
    localStorage.setItem(STORAGE_KEYS.MONTHLY_COSTS, JSON.stringify(allCosts));
  },

  getMonthlyData: (date) => {
    const payments = db.getPayments();
    const monthKey = format(date, 'yyyy-MM');
    const allCosts = JSON.parse(localStorage.getItem(STORAGE_KEYS.MONTHLY_COSTS) || '{}');

    const income = payments.reduce((acc, p) => {
      const pDate = parseISO(p.date);
      if (pDate.getFullYear() === date.getFullYear() && pDate.getMonth() === date.getMonth()) {
        return acc + (parseFloat(p.amount) || 0);
      }
      return acc;
    }, 0);

    const costs = allCosts[monthKey] || { rent: 0, utilities: 0, staff: 0, other: 0 };
    const totalCosts = Object.values(costs).reduce((a, b) => parseFloat(a || 0) + parseFloat(b || 0), 0);

    return { income, costs, totalCosts, profit: income - totalCosts };
  },

  getFinancialHistory: (monthsLimit = 6) => {
    const history = [];
    const now = new Date();
    for (let i = monthsLimit - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = format(d, 'MMM yy');
      const data = db.getMonthlyData(d);

      history.push({
        name: label,
        monthKey: format(d, 'yyyy-MM'),
        ingresos: data.income,
        gastos: data.totalCosts,
        utilidad: data.profit
      });
    }
    return history;
  }
};

db.init(); // Auto-init on load
