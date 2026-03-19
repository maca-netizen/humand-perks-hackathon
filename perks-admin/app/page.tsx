"use client"

// Safe number formatter — avoids hydration mismatch between server/client
function fmtNum(n: number): string { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }
function fmtCurrency(n: number): string { return "$" + fmtNum(n) }

import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  BarChart3, Users, Gift, CreditCard, Upload, UserPlus, Zap,
  Settings, TrendingUp, Search, Plus, Trash2, Edit3, Check,
  X, ChevronDown, ChevronRight, Calendar, Clock, Award,
  DollarSign, ArrowUpRight, ArrowDownRight, Filter, Download,
  Eye, MoreVertical, Bell, Globe, HelpCircle, Star, Repeat,
  FileText, AlertCircle, CheckCircle, ChevronLeft, Home,
  Layers, LayoutDashboard, Package, PieChart, UserCheck, Sparkles, PartyPopper,
  ShoppingCart, Wallet
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie,
  Cell, Area, AreaChart, Legend
} from "recharts";

/* ════════════════════════════════════════════
   I18N SYSTEM
   ════════════════════════════════════════════ */
const i18n = {
  es: {
    dashboard: "Dashboard", general: "General", usuarios: "Usuarios",
    creditosDisponibles: "Créditos disponibles para asignar",
    creditosAdquiridos: "Créditos adquiridos", creditosAsignados: "Créditos asignados",
    creditosCanjeados: "Créditos canjeados", tasaCanje: "Tasa de canje",
    proximosVencer: "Próximos a vencer", notificar: "Notificar",
    comprarCreditos: "Comprar más créditos", colaboradores: "Colaboradores",
    beneficios: "Beneficios", reglasAutomaticas: "Reglas automáticas",
    comprar: "Comprar créditos", buscar: "Buscar...",
    cargados: "Cargados", canjeados: "Canjeados", disponible: "Disponible",
    departamento: "Departamento", estado: "Estado", acciones: "Acciones",
    activo: "Activo", inactivo: "Inactivo", cargar: "Cargar",
    cargaMasiva: "Carga masiva", nuevoBeneficio: "Nuevo beneficio",
    crearRegla: "Crear regla", reglasAsignacion: "Reglas de asignación",
    reglasGeneracion: "Reglas de generación", categoria: "Categoría",
    todos: "Todos", cancelar: "Cancelar", confirmar: "Confirmar",
    canjePorCategoria: "Canjes por categoría", usoPorDepto: "Uso por departamento",
    actividadReciente: "Actividad reciente", creditosVsMes: "Créditos cargados vs canjeados",
    topBeneficios: "Top beneficios más canjeados", topUsuarios: "Colaboradores con mayor uso",
    seleccionarPlan: "Seleccionar plan de créditos", pagarConTarjeta: "Pagar con tarjeta",
    monto: "Monto", motivo: "Motivo", nota: "Nota",
    dashCreditos: "Dashboard de Créditos", seguimiento: "Seguimiento general del uso de créditos en la plataforma",
    delTotalAsignado: "del total asignado", canjes: "canjes",
    vencenEn7Dias: "colaboradores tienen créditos que vencen en los próximos 7 días",
    insights: "Insights", tendenciaSemanal: "Tendencia de canjes semanal",
    gestionBeneficios: "Gestión de Beneficios", adminCatalogo: "Administrá el catálogo de beneficios disponibles para canjear",
    creditosCargados: "Créditos cargados", creditosUsados: "Créditos usados",
    gestionaCreditos: "Gestioná créditos de tus colaboradores de forma individual o masiva",
    totalUsuarios: "Total usuarios", usuariosActivos: "Usuarios activos",
    promCreditos: "Promedio créditos/usuario", salud: "Salud", educacion: "Educación",
    gastronomia: "Gastronomía", entretenimiento: "Entretenimiento", bienestar: "Bienestar",
    segmentar: "Segmentar", proveedor: "Proveedor", costoCreditos: "Costo en créditos",
    stock: "Stock disponible (opcional)", descripcion: "Descripción", imagenEmoji: "Imagen o emoji representativo",
    crearBeneficio: "Crear beneficio", editarBenef: "Editar", verBenef: "Ver",
    pausado: "Pausado", creditosLabel: "créditos", canjesLabel: "canjes",
    nombreRegla: "Nombre de la regla", tipoTrigger: "Tipo de trigger",
    periodicidad: "Periodicidad (si aplica)", cantidadCreditos: "Cantidad de créditos",
    aplicarA: "Aplicar a", fechaExpiracion: "Fecha de expiración de créditos (opcional)",
    nuevaRegla: "Nueva regla automática", trigger: "Trigger", ultimaEjecucion: "Última ejecución",
    activa: "Activa", pausada: "Pausada", activar: "Activar", pausar: "Pausar",
    comprarCreditosTitulo: "Comprar créditos",
    comprarCreditosDesc: "Adquirí paquetes de créditos para distribuir entre tus colaboradores",
    starter: "Starter", professional: "Professional", enterprise: "Enterprise",
    popular: "Popular", mes: "/mes", caracteristicas: "Características",
    seleccionar: "Seleccionar", pagoPersonalizado: "Pago personalizado",
    cantidadPersonalizada: "Cantidad personalizada de créditos",
    tuCompra: "Tu compra", resumen: "Resumen",
    numTarjeta: "Número de tarjeta", vencimiento: "Vencimiento", titular: "Titular",
    procesarPago: "Procesar pago", pendientes: "pendientes",
    cargaPeriodica: "Carga periódica", cumpleanos: "Cumpleaños",
    aniversarioLaboral: "Aniversario laboral", onboarding: "Onboarding",
    regla: "regla", reglas: "reglas", personas: "personas",
    sumarCreditos: "Sumar créditos", montoRapido: "Monto rápido",
    resumenCompra: "Resumen de compra", preciosReferencia: "Precios de referencia",
    opcional: "opcional",
  },
  en: {
    dashboard: "Dashboard", general: "General", usuarios: "Users",
    creditosDisponibles: "Credits available to assign",
    creditosAdquiridos: "Credits purchased", creditosAsignados: "Credits assigned",
    creditosCanjeados: "Credits redeemed", tasaCanje: "Redemption rate",
    proximosVencer: "Expiring soon", notificar: "Notify",
    comprarCreditos: "Buy more credits", colaboradores: "Employees",
    beneficios: "Benefits", reglasAutomaticas: "Auto rules",
    comprar: "Buy credits", buscar: "Search...",
    cargados: "Loaded", canjeados: "Redeemed", disponible: "Available",
    departamento: "Department", estado: "Status", acciones: "Actions",
    activo: "Active", inactivo: "Inactive", cargar: "Load",
    cargaMasiva: "Bulk load", nuevoBeneficio: "New benefit",
    crearRegla: "Create rule", reglasAsignacion: "Assignment rules",
    reglasGeneracion: "Generation rules", categoria: "Category",
    todos: "All", cancelar: "Cancel", confirmar: "Confirm",
    canjePorCategoria: "Redemptions by category", usoPorDepto: "Usage by department",
    actividadReciente: "Recent activity", creditosVsMes: "Credits loaded vs redeemed",
    topBeneficios: "Top redeemed benefits", topUsuarios: "Top users by usage",
    seleccionarPlan: "Select credit plan", pagarConTarjeta: "Pay with card",
    monto: "Amount", motivo: "Reason", nota: "Note",
    dashCreditos: "Credits Dashboard", seguimiento: "General tracking of credit usage on the platform",
    delTotalAsignado: "of total assigned", canjes: "redemptions",
    vencenEn7Dias: "employees have credits expiring in the next 7 days",
    insights: "Insights", tendenciaSemanal: "Weekly redemption trend",
    gestionBeneficios: "Benefits Management", adminCatalogo: "Manage the benefits catalog available for redemption",
    creditosCargados: "Credits loaded", creditosUsados: "Credits used",
    gestionaCreditos: "Manage your employees credits individually or in bulk",
    totalUsuarios: "Total users", usuariosActivos: "Active users",
    promCreditos: "Avg credits/user", salud: "Health", educacion: "Education",
    gastronomia: "Food", entretenimiento: "Entertainment", bienestar: "Wellness",
    segmentar: "Segment", proveedor: "Provider", costoCreditos: "Cost in credits",
    stock: "Available stock (optional)", descripcion: "Description", imagenEmoji: "Image or emoji",
    crearBeneficio: "Create benefit", editarBenef: "Edit", verBenef: "View",
    pausado: "Paused", creditosLabel: "credits", canjesLabel: "redemptions",
    nombreRegla: "Rule name", tipoTrigger: "Trigger type",
    periodicidad: "Periodicity (if applicable)", cantidadCreditos: "Credit amount",
    aplicarA: "Apply to", fechaExpiracion: "Credit expiration date (optional)",
    nuevaRegla: "New auto rule", trigger: "Trigger", ultimaEjecucion: "Last run",
    activa: "Active", pausada: "Paused", activar: "Activate", pausar: "Pause",
    comprarCreditosTitulo: "Buy Credits",
    comprarCreditosDesc: "Purchase credit packages to distribute among your employees",
    starter: "Starter", professional: "Professional", enterprise: "Enterprise",
    popular: "Popular", mes: "/mo", caracteristicas: "Features",
    seleccionar: "Select", pagoPersonalizado: "Custom payment",
    cantidadPersonalizada: "Custom credit amount",
    tuCompra: "Your purchase", resumen: "Summary",
    numTarjeta: "Card number", vencimiento: "Expiry", titular: "Cardholder",
    procesarPago: "Process payment", pendientes: "pending",
    cargaPeriodica: "Periodic load", cumpleanos: "Birthday",
    aniversarioLaboral: "Work anniversary", onboarding: "Onboarding",
    regla: "rule", reglas: "rules", personas: "people",
    sumarCreditos: "Add credits", montoRapido: "Quick amount",
    resumenCompra: "Purchase summary", preciosReferencia: "Price reference",
    opcional: "optional",
  }
};

type Lang = "es" | "en";
type T = typeof i18n.es;

/* ════════════════════════════════════════════
   DESIGN SYSTEM TOKENS (Humand Foundations)
   ════════════════════════════════════════════ */
const tokens = {
  colors: {
    humand: { 50:"#f1f4fd",100:"#dee5fb",200:"#c5d4f8",300:"#9db8f3",400:"#6f93eb",500:"#496be3",600:"#3851d8",700:"#2f3fc6",800:"#2c35a1",900:"#29317f",950:"#1d204e" },
    neutral: { 50:"#f5f6f8",100:"#eeeef1",150:"#E9E9ED",200:"#dfe0e6",300:"#cbcdd6",400:"#b5b6c4",500:"#aaaaba",600:"#8d8c9f",700:"#79788a",800:"#636271",900:"#53525d",950:"#303036" },
    green: { 50:"#f5fdf6",100:"#e6fbe9",200:"#cff6d5",300:"#abedb6",400:"#7bdd8b",500:"#4ed364",600:"#28c040",700:"#249637",800:"#227831" },
    red: { 50:"#fef2f2",100:"#fde3e3",200:"#fccccc",300:"#f8a9a9",400:"#f27777",500:"#e74444",600:"#d42e2e",700:"#b22323" },
    yellow: { 50:"#fdfaec",100:"#fcf7ce",200:"#fbeb9d",300:"#f8da65",400:"#f4c83f",500:"#f0b623",600:"#de920c",700:"#b1690e" },
    info: { 50:"#f8fdfe",100:"#ecfafc",200:"#ddf5f9",300:"#c2edf4",400:"#a1dfeb",500:"#6fd1e7",600:"#46badd" },
    purple: { 50:"#f4f2ff",100:"#e9e8ff",200:"#d6d4ff",300:"#b9b1ff",400:"#9785ff",500:"#886bff",600:"#6330f7" },
    teal: { 50:"#f2fbf8",100:"#d5f2e9",400:"#4bb69f",500:"#35a48e",600:"#267b6c" },
  },
  semantic: {
    textDefault: "#303036",
    textLighter: "#636271",
    textDisabled: "#aaaaba",
    brand400: "#6f93eb",
    bgPage: "#f5f6f8",
    bgCard: "#ffffff",
    bgTableHeader: "#eff2ff",
    textTableHeader: "#213478",
    border: "#dfe0e6",
    borderLight: "#eeeef1",
  },
  shadow: {
    dp2: "0 1px 3px rgba(0,0,0,0.06)",
    dp4: "-1px 4px 8px 0px rgba(233,233,244,1)",
    dp8: "-1px 8px 16px 0px rgba(170,170,186,0.45)",
    dp12: "-2px 12px 32px rgba(48,48,54,0.18)",
    glow: "0 4px 14px rgba(73,107,227,0.35)",
  },
  radius: { s: 4, m: 8, l: 16 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40 },
  transition: {
    fast: "all 0.15s cubic-bezier(0.4,0,0.2,1)",
    medium: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
  },
};

/* ════════════════════════════════════════════
   DATA HOOK — Fetches from Supabase
   ════════════════════════════════════════════ */

const categoryColors: Record<string, string> = {
  bienestar: tokens.colors.humand[500],
  gastronomia: tokens.colors.teal[500],
  gastronomía: tokens.colors.teal[500],
  educacion: tokens.colors.purple[500],
  educación: tokens.colors.purple[500],
  entretenimiento: tokens.colors.yellow[500],
  salud: tokens.colors.red[400],
  shopping: tokens.colors.red[400],
};

const categoryEmojis: Record<string, string> = {
  salud: "🏋️", bienestar: "🧘", gastronomia: "🍕", gastronomía: "🍕",
  educacion: "📚", educación: "📚", entretenimiento: "🎬", shopping: "🛍️",
};

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(date: string) {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

function useAdminData() {
  const [users, setUsers] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [autoRulesData, setAutoRulesData] = useState<any[]>([]);
  const [bulkHistoryData, setBulkHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    async function fetchAll() {
      const [uRes, bRes, tRes, wRes, arRes, bhRes] = await Promise.all([
        supabase.from("users").select("*"),
        supabase.from("benefits").select("*"),
        supabase.from("transactions").select("*, benefits(name, image_url)").order("created_at", { ascending: false }),
        supabase.from("wallets").select("*"),
        supabase.from("auto_rules").select("*").order("created_at", { ascending: false }),
        supabase.from("bulk_history").select("*").order("date", { ascending: false }),
      ]);
      setUsers(uRes.data || []);
      setBenefits(bRes.data || []);
      setTransactions(tRes.data || []);
      setWallets(wRes.data || []);
      setAutoRulesData(arRes.data || []);
      setBulkHistoryData(bhRes.data || []);
      setLoading(false);
    }
    fetchAll();
  }, [refreshKey]);

  const credits = transactions.filter(t => t.type === "credit");
  const debits = transactions.filter(t => t.type === "debit");
  const totalCredited = credits.reduce((s, t) => s + Number(t.amount), 0);
  const totalRedeemed = debits.reduce((s, t) => s + Number(t.amount), 0);
  const totalPending = Math.round((totalCredited - totalRedeemed) * 100) / 100;
  const employees = users.filter(u => u.role === "employee");

  const usersWithWallet = users.map(u => {
    const w = wallets.find(w => w.user_id === u.id);
    const userCredits = credits.filter(t => t.wallet_id === w?.id).reduce((s, t) => s + Number(t.amount), 0);
    const userSpent = debits.filter(t => t.wallet_id === w?.id).reduce((s, t) => s + Number(t.amount), 0);
    return { ...u, avatar: getInitials(u.name), credits: userCredits, spent: userSpent, balance: w?.balance || 0 };
  });

  const benefitsWithStats = benefits.map(b => {
    const redemptionCount = debits.filter(t => t.benefit_id === b.id).length;
    return { ...b, credits: Number(b.cost), provider: b.merchant || "", status: b.active ? "active" : "paused", redemptions: redemptionCount, image: categoryEmojis[b.category?.toLowerCase()] || "🎁" };
  });

  const catCounts: Record<string, number> = {};
  debits.forEach(t => {
    const benefit = benefits.find(b => b.id === t.benefit_id);
    if (benefit) { const cat = benefit.category || "Otro"; catCounts[cat] = (catCounts[cat] || 0) + 1; }
  });
  const totalDebits = debits.length || 1;
  const categoryData = Object.entries(catCounts).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round((count / totalDebits) * 100),
    color: categoryColors[name.toLowerCase()] || tokens.colors.neutral[400],
  }));

  const deptMap: Record<string, { total: number; spent: number }> = {};
  usersWithWallet.forEach(u => {
    if (!u.dept) return;
    if (!deptMap[u.dept]) deptMap[u.dept] = { total: 0, spent: 0 };
    deptMap[u.dept].total += u.credits || 1;
    deptMap[u.dept].spent += u.spent;
  });
  const deptUsage = Object.entries(deptMap).map(([dept, v]) => ({ dept, usage: v.total > 0 ? Math.round((v.spent / v.total) * 100) : 0 }));

  const recentActivity = transactions.slice(0, 5).map(t => {
    const user = users.find(u => { const w = wallets.find(w => w.user_id === u.id); return w?.id === t.wallet_id; });
    return { user: user?.name || "Usuario", action: t.description, credits: t.type === "credit" ? Number(t.amount) : -Number(t.amount), time: timeAgo(t.created_at), type: t.type === "credit" ? "credit" : "redemption" };
  });

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthMap: Record<string, { cargados: number; canjeados: number }> = {};
  transactions.forEach(t => {
    const d = new Date(t.created_at);
    const key = monthNames[d.getMonth()];
    if (!monthMap[key]) monthMap[key] = { cargados: 0, canjeados: 0 };
    if (t.type === "credit") monthMap[key].cargados += Number(t.amount); else monthMap[key].canjeados += Number(t.amount);
  });
  const monthlyCredits = Object.entries(monthMap).map(([month, v]) => ({ month, ...v }));
  if (monthlyCredits.length === 0) monthlyCredits.push({ month: "Mar", cargados: 0, canjeados: 0 });

  const autoRules = autoRulesData.map(r => ({ ...r, amount: Number(r.amount), lastRun: r.last_run ? new Date(r.last_run).toLocaleDateString("es-AR") : "—" }));

  const ruleTypes = [
    { id: 1, name: "Carga periódica", icon: "repeat", rulesCount: autoRules.filter(r => r.type === "periodic").length, usersCount: employees.length, description: "Cargas recurrentes en intervalos regulares" },
    { id: 2, name: "Cumpleaños", icon: "cake", rulesCount: autoRules.filter(r => r.trigger === "Cumpleaños").length, usersCount: employees.length, description: "Créditos automáticos en el cumpleaños" },
    { id: 3, name: "Aniversario laboral", icon: "award", rulesCount: autoRules.filter(r => r.trigger === "Aniversario").length, usersCount: employees.length, description: "Bonus por años en la empresa" },
    { id: 4, name: "Onboarding", icon: "userplus", rulesCount: autoRules.filter(r => r.trigger === "Alta de usuario").length, usersCount: employees.length, description: "Bienvenida a nuevos colaboradores" },
  ];

  const bulkHistory = bulkHistoryData.map(b => ({ ...b, date: new Date(b.date).toLocaleDateString("es-AR"), users: b.users_count, credits: Number(b.credits), total: Number(b.total), by: b.created_by || "—" }));

  return { loading, refresh, users: usersWithWallet, benefits: benefitsWithStats, transactions, totalCredited, totalRedeemed, totalPending, employees, categoryData, deptUsage, recentActivity, monthlyCredits, autoRules, ruleTypes, bulkHistory, wallets };
}

/* ════════════════════════════════════════════
   SHARED COMPONENTS
   ════════════════════════════════════════════ */
const baseStyles = { fontFamily: "'Roboto', sans-serif", letterSpacing: "0.2px", color: tokens.semantic.textDefault };

function Avatar({ initials, size = 36, color = tokens.colors.humand[400] }: any) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: tokens.colors.humand[100], color: tokens.colors.humand[700], display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 600, letterSpacing: "0.2px", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Badge({ children, variant = "default" }: any) {
  const variants: any = {
    default: { bg: tokens.colors.humand[100], color: tokens.colors.humand[700] },
    success: { bg: tokens.colors.green[100], color: tokens.colors.green[700] },
    warning: { bg: tokens.colors.yellow[100], color: tokens.colors.yellow[700] },
    error: { bg: tokens.colors.red[100], color: tokens.colors.red[700] },
    info: { bg: tokens.colors.info[100], color: tokens.colors.info[700] },
    neutral: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[700] },
  };
  const v = variants[variant] || variants.default;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: v.bg, color: v.color, letterSpacing: "0.2px", lineHeight: 1.4 }}>
      {children}
    </span>
  );
}

function Button({ children, variant = "primary", size = "md", icon: Icon, onClick, style: extraStyle }: any) {
  const [hovered, setHovered] = useState(false);
  const sizes: any = { sm: { padding: "6px 12px", fontSize: 12 }, md: { padding: "8px 16px", fontSize: 14 }, lg: { padding: "12px 24px", fontSize: 16 } };
  const borderBase = variant === "secondary" ? `1px solid ${hovered ? tokens.colors.humand[400] : tokens.colors.humand[300]}` : "none";
  const variants: any = {
    primary: { bg: `linear-gradient(135deg, ${tokens.colors.humand[500]}, ${tokens.colors.humand[600]})`, color: "#fff" },
    secondary: { bg: "#fff", color: tokens.colors.humand[500] },
    ghost: { bg: "transparent", color: tokens.semantic.textLighter },
    danger: { bg: `linear-gradient(135deg, ${tokens.colors.red[500]}, ${tokens.colors.red[600]})`, color: "#fff" },
    gradient: { bg: `linear-gradient(135deg, ${tokens.colors.humand[500]}, ${tokens.colors.purple[500]})`, color: "#fff" },
  };
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  const hoverStyle = hovered ? (
    variant === "primary" || variant === "danger" || variant === "gradient"
      ? { transform: "translateY(-1px)", boxShadow: tokens.shadow.glow }
      : variant === "secondary"
        ? { boxShadow: tokens.shadow.dp2 }
        : { background: tokens.colors.neutral[100] }
  ) : {};
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ ...s, ...baseStyles, fontWeight: 600, borderRadius: tokens.radius.m, background: v.bg, color: v.color, borderTop: borderBase, borderRight: borderBase, borderBottom: borderBase, borderLeft: borderBase, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, transition: tokens.transition.fast, ...hoverStyle, ...extraStyle }}>
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

function Card({ children, style: extraStyle, noPadding, hoverable }: any) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={hoverable ? () => setHovered(true) : undefined} onMouseLeave={hoverable ? () => setHovered(false) : undefined}
      style={{ background: tokens.semantic.bgCard, borderRadius: tokens.radius.l, boxShadow: hovered ? tokens.shadow.dp8 : tokens.shadow.dp4, borderTop: `1px solid ${hovered ? tokens.colors.humand[200] : "transparent"}`, borderRight: `1px solid ${hovered ? tokens.colors.humand[200] : "transparent"}`, borderBottom: `1px solid ${hovered ? tokens.colors.humand[200] : "transparent"}`, borderLeft: `1px solid ${hovered ? tokens.colors.humand[200] : "transparent"}`, padding: noPadding ? 0 : 24, transition: tokens.transition.medium, ...extraStyle }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, trendUp, color = tokens.colors.humand[500] }: any) {
  return (
    <Card hoverable style={{ display: "flex", alignItems: "flex-start", gap: 16, boxShadow: `inset 3px 0 0 ${color}, ${tokens.shadow.dp4}` }}>
      <div style={{ width: 52, height: 52, borderRadius: tokens.radius.m, background: `radial-gradient(circle at top left, ${color}20, ${color}08)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={26} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: tokens.semantic.textLighter, lineHeight: 1.4, letterSpacing: "0.2px", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.2px" }}>{value}</div>
        {trend && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 12, color: trendUp ? tokens.colors.green[600] : tokens.colors.red[500], letterSpacing: "0.2px" }}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
      </div>
    </Card>
  );
}

function SearchInput({ value, onChange, placeholder = "Buscar..." }: any) {
  return (
    <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
      <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: tokens.semantic.textDisabled }} />
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ ...baseStyles, width: "100%", padding: "8px 12px 8px 36px", border: `1px solid ${tokens.semantic.border}`, borderRadius: tokens.radius.m, fontSize: 14, lineHeight: 1.4, outline: "none", background: "#fff", boxSizing: "border-box" as const }} />
    </div>
  );
}

function Table({ columns, data }: any) {
  const [hoveredRow, setHoveredRow] = useState(-1);
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", ...baseStyles, fontSize: 14, lineHeight: 1.4 }}>
        <thead>
          <tr>
            {columns.map((col: any, i: number) => (
              <th key={i} style={{ padding: "12px 16px", textAlign: "left" as const, fontWeight: 700, fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.5px", background: tokens.semantic.bgTableHeader, color: tokens.semantic.textTableHeader, borderBottom: `1px solid ${tokens.semantic.borderLight}`, lineHeight: 1.4, ...(i === 0 ? { borderRadius: "8px 0 0 0" } : {}), ...(i === columns.length - 1 ? { borderRadius: "0 8px 0 0" } : {}) }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: 40, textAlign: "center" as const, color: tokens.semantic.textDisabled, fontSize: 13 }}>No hay datos disponibles</td></tr>
          ) : data.map((row: any, ri: number) => (
            <tr key={ri} onMouseEnter={() => setHoveredRow(ri)} onMouseLeave={() => setHoveredRow(-1)}
              style={{ borderBottom: `1px solid ${tokens.semantic.borderLight}`, background: hoveredRow === ri ? tokens.colors.neutral[50] : "transparent", transition: tokens.transition.fast }}>
              {columns.map((col: any, ci: number) => (
                <td key={ci} style={{ padding: "12px 16px", color: tokens.semantic.textDefault, letterSpacing: "0.2px" }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tabs({ tabs, active, onChange }: any) {
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${tokens.semantic.borderLight}`, marginBottom: 24 }}>
      {tabs.map((t: any) => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          ...baseStyles, padding: "12px 20px", fontSize: 14, fontWeight: active === t.key ? 600 : 400,
          color: active === t.key ? tokens.colors.humand[500] : tokens.semantic.textLighter,
          background: "transparent", border: "none", cursor: "pointer",
          borderBottom: active === t.key ? `2px solid ${tokens.colors.humand[500]}` : "2px solid transparent",
          marginBottom: -2, transition: "all 0.15s ease", letterSpacing: "0.2px",
        }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Modal({ title, onClose, children, wide }: any) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn 0.2s ease-out" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 32, width: wide ? 640 : 480, maxHeight: "85vh", overflowY: "auto" as const, boxShadow: tokens.shadow.dp12, animation: "fadeInUp 0.25s ease-out" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ ...baseStyles, fontSize: 18, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: tokens.semantic.textLighter, padding: 4 }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }: any) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ ...baseStyles, display: "block", fontSize: 12, fontWeight: 600, color: tokens.semantic.textLighter, marginBottom: 6, letterSpacing: "0.2px", lineHeight: 1.4 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ ...props }: any) {
  return <input {...props} style={{ ...baseStyles, width: "100%", padding: "10px 12px", border: `1px solid ${tokens.semantic.border}`, borderRadius: tokens.radius.s, fontSize: 14, lineHeight: 1.4, outline: "none", boxSizing: "border-box" as const, ...props.style }} />;
}

function Select({ options, ...props }: any) {
  return (
    <select {...props} style={{ ...baseStyles, width: "100%", padding: "10px 12px", border: `1px solid ${tokens.semantic.border}`, borderRadius: tokens.radius.s, fontSize: 14, lineHeight: 1.4, outline: "none", background: "#fff", boxSizing: "border-box" as const, ...props.style }}>
      {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function EmptyDrop({ label }: any) {
  return (
    <div style={{ border: `2px dashed ${tokens.semantic.border}`, borderRadius: tokens.radius.m, padding: 40, textAlign: "center" as const, color: tokens.semantic.textLighter }}>
      <Upload size={32} style={{ marginBottom: 12, color: tokens.colors.humand[400] }} />
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, letterSpacing: "0.2px" }}>{label}</div>
      <div style={{ fontSize: 12, letterSpacing: "0.2px" }}>Arrastrá un archivo o hacé click para seleccionar</div>
    </div>
  );
}

function ProgressBar({ value, max, color = tokens.colors.humand[500] }: any) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ width: "100%", height: 6, background: tokens.colors.neutral[100], borderRadius: 3 }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.3s ease" }} />
    </div>
  );
}

/* ════════════════════════════════════════════
   PAGE: DASHBOARD (General + Usuarios tabs)
   ════════════════════════════════════════════ */
function DashboardPage({ data, t, onNavigate, onRefresh }: { data: any; t: T; onNavigate: (page: string) => void; onRefresh: () => void }) {
  const { totalCredited, totalRedeemed, totalPending, employees, categoryData, deptUsage, recentActivity, monthlyCredits } = data;
  const rate = totalCredited > 0 ? Math.round((totalRedeemed / totalCredited) * 100) : 0;
  const totalPurchased = totalCredited + totalPending;
  const [tab, setTab] = useState("general");
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [loadAmount, setLoadAmount] = useState("");
  const [loadReason, setLoadReason] = useState("");
  const [loadNote, setLoadNote] = useState("");
  const [loadingCredits, setLoadingCredits] = useState(false);

  const handleLoadCredits = async () => {
    if (!selected || !loadAmount || Number(loadAmount) <= 0) return;
    setLoadingCredits(true);
    try {
      const reasons: Record<string, string> = { bonus: "Bonus especial", adjustment: "Ajuste", compensation: "Compensación", other: "Otro" };
      const desc = (reasons[loadReason] || "Carga manual") + (loadNote ? ` - ${loadNote}` : "");
      const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", selected.id).single();
      if (!wallet) throw new Error("Wallet not found");
      const newBalance = Math.round((Number(wallet.balance) + Number(loadAmount)) * 100) / 100;
      await supabase.from("wallets").update({ balance: newBalance, updated_at: new Date().toISOString() }).eq("id", wallet.id);
      await supabase.from("transactions").insert({ user_id: selected.id, wallet_id: wallet.id, type: "credit", amount: Number(loadAmount), description: desc });
      toast.success(`Se cargaron ${loadAmount} créditos a ${selected.name}`);
      setShowModal(false); setSelected(null); setLoadAmount(""); setLoadReason(""); setLoadNote(""); onRefresh();
    } catch (e) { console.error(e); toast.error("Error al cargar créditos"); }
    setLoadingCredits(false);
  };

  const filtered = data.users.filter((u: any) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.dept || "").toLowerCase().includes(search.toLowerCase())
  );

  const topBenefits = [...data.benefits].sort((a: any, b: any) => b.redemptions - a.redemptions).slice(0, 5);
  const topUsers = [...data.users].sort((a: any, b: any) => b.spent - a.spent).slice(0, 5);
  const weeklyTrend = [{ week: "Sem 1", canjes: 45 }, { week: "Sem 2", canjes: 62 }, { week: "Sem 3", canjes: 58 }, { week: "Sem 4", canjes: 71 }];

  const activeUsers = data.users.filter((u: any) => u.status === "active").length;
  const avgCredits = employees.length > 0 ? Math.round(totalCredited / employees.length) : 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{t.dashCreditos}</h1>
          <p style={{ ...baseStyles, fontSize: 14, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>{t.seguimiento}</p>
        </div>
        {tab === "general" && (
          <Button variant="gradient" icon={ShoppingCart} onClick={() => onNavigate("buy")} size="lg">
            {t.comprarCreditos}
          </Button>
        )}
      </div>

      <Tabs tabs={[{ key: "general", label: t.general }, { key: "usuarios", label: t.usuarios }]} active={tab} onChange={setTab} />

      {/* ── TAB GENERAL ── */}
      {tab === "general" && (
        <div>
          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
            <StatCard label={t.creditosAdquiridos} value={fmtCurrency(totalPurchased)} icon={Wallet} trend={t.creditosDisponibles} trendUp color={tokens.colors.purple[500]} />
            <StatCard label={t.creditosAsignados} value={fmtCurrency(totalCredited)} icon={CreditCard} trend={`${employees.length} ${t.colaboradores.toLowerCase()}`} trendUp color={tokens.colors.humand[500]} />
            <StatCard label={t.creditosCanjeados} value={fmtCurrency(totalRedeemed)} icon={Gift} trend={`${data.transactions.filter((tx: any) => tx.type === 'debit').length} ${t.canjes}`} trendUp color={tokens.colors.green[600]} />
            <StatCard label={t.tasaCanje} value={`${rate}%`} icon={TrendingUp} trend={t.delTotalAsignado} trendUp={rate > 50} color={tokens.colors.teal[500]} />
          </div>

          {/* Expiring soon alert */}
          <Card style={{ marginBottom: 32, background: `linear-gradient(135deg, ${tokens.colors.yellow[50]}, ${tokens.colors.yellow[100]})`, borderLeft: `4px solid ${tokens.colors.yellow[500]}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: tokens.colors.yellow[200], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bell size={22} color={tokens.colors.yellow[700]} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: tokens.colors.yellow[700], letterSpacing: "0.2px" }}>{t.proximosVencer}</div>
                <div style={{ fontSize: 13, color: tokens.colors.yellow[700], marginTop: 2, letterSpacing: "0.2px" }}>3 {t.vencenEn7Dias}</div>
              </div>
              <Button variant="secondary" size="sm" icon={Bell} onClick={() => toast.success("Notificaciones enviadas")}>{t.notificar}</Button>
            </div>
          </Card>

          {/* Charts Row */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 32 }}>
            <Card>
              <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 20px 0", lineHeight: 1.4 }}>{t.creditosVsMes}</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyCredits}>
                  <defs>
                    <linearGradient id="gradLoaded" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={tokens.colors.humand[400]} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={tokens.colors.humand[400]} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradRedeemed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={tokens.colors.green[500]} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={tokens.colors.green[500]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={tokens.semantic.borderLight} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: tokens.semantic.textLighter }} />
                  <YAxis tick={{ fontSize: 12, fill: tokens.semantic.textLighter }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${tokens.semantic.border}`, fontSize: 13, fontFamily: "Roboto" }} />
                  <Area type="monotone" dataKey="cargados" stroke={tokens.colors.humand[500]} fill="url(#gradLoaded)" strokeWidth={2} name={t.cargados} />
                  <Area type="monotone" dataKey="canjeados" stroke={tokens.colors.green[500]} fill="url(#gradRedeemed)" strokeWidth={2} name={t.canjeados} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: "Roboto" }} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 20px 0", lineHeight: 1.4 }}>{t.canjePorCategoria}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RePieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, fontFamily: "Roboto" }} />
                </RePieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {categoryData.map((c: any, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, letterSpacing: "0.2px" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, color: tokens.semantic.textDefault }}>{c.name}</span>
                    <span style={{ fontWeight: 600 }}>{c.value}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Usage by department + Recent Activity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
            <Card>
              <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 20px 0", lineHeight: 1.4 }}>{t.usoPorDepto}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {deptUsage.map((d: any, i: number) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, letterSpacing: "0.2px" }}>
                      <span style={{ color: tokens.semantic.textDefault }}>{d.dept}</span>
                      <span style={{ fontWeight: 600, color: tokens.semantic.textDefault }}>{d.usage}%</span>
                    </div>
                    <ProgressBar value={d.usage} max={100} color={d.usage > 75 ? tokens.colors.green[500] : d.usage > 50 ? tokens.colors.humand[400] : tokens.colors.yellow[500]} />
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 20px 0", lineHeight: 1.4 }}>{t.actividadReciente}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {recentActivity.map((a: any, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < recentActivity.length - 1 ? `1px solid ${tokens.semantic.borderLight}` : "none" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: a.type === "credit" ? tokens.colors.green[100] : tokens.colors.humand[100], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {a.type === "credit" ? <ArrowUpRight size={16} color={tokens.colors.green[600]} /> : <Gift size={16} color={tokens.colors.humand[500]} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.2px", lineHeight: 1.4 }}>{a.user}</div>
                      <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px", lineHeight: 1.4 }}>{a.action}</div>
                    </div>
                    <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: a.credits > 0 ? tokens.colors.green[600] : tokens.colors.red[500], letterSpacing: "0.2px" }}>
                        {a.credits > 0 ? "+" : ""}{fmtNum(a.credits)}
                      </div>
                      <div style={{ fontSize: 11, color: tokens.semantic.textDisabled, letterSpacing: "0.2px" }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Insights collapsible */}
          <Card style={{ marginBottom: 0 }}>
            <button onClick={() => setInsightsOpen(!insightsOpen)} style={{ ...baseStyles, display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0, width: "100%", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={18} color={tokens.colors.purple[500]} />
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, lineHeight: 1.4 }}>{t.insights}</h3>
              </div>
              <ChevronDown size={18} style={{ transition: "transform 0.2s ease", transform: insightsOpen ? "rotate(0deg)" : "rotate(-90deg)", color: tokens.semantic.textLighter }} />
            </button>
            {insightsOpen && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <h4 style={{ ...baseStyles, fontSize: 14, fontWeight: 600, margin: "0 0 12px 0" }}>{t.tendenciaSemanal}</h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={weeklyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke={tokens.semantic.borderLight} />
                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: tokens.semantic.textLighter }} />
                        <YAxis tick={{ fontSize: 11, fill: tokens.semantic.textLighter }} />
                        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, fontFamily: "Roboto" }} />
                        <Bar dataKey="canjes" fill={tokens.colors.humand[400]} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 style={{ ...baseStyles, fontSize: 14, fontWeight: 600, margin: "0 0 12px 0" }}>{t.topBeneficios}</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {topBenefits.map((b: any, i: number) => (
                        <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                          <span style={{ fontWeight: 600, color: tokens.semantic.textDisabled, width: 16 }}>#{i + 1}</span>
                          <span style={{ fontSize: 16 }}>{b.image}</span>
                          <span style={{ flex: 1, fontWeight: 500 }}>{b.name}</span>
                          <span style={{ fontWeight: 600 }}>{b.redemptions}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ ...baseStyles, fontSize: 14, fontWeight: 600, margin: "0 0 12px 0" }}>{t.topUsuarios}</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {topUsers.map((u: any, i: number) => (
                        <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                          <span style={{ fontWeight: 600, color: tokens.semantic.textDisabled, width: 16 }}>#{i + 1}</span>
                          <Avatar initials={u.avatar} size={24} />
                          <span style={{ flex: 1, fontWeight: 500 }}>{u.name}</span>
                          <span style={{ fontWeight: 600 }}>{fmtNum(u.spent)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── TAB USUARIOS ── */}
      {tab === "usuarios" && (
        <div>
          {/* Quick stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            <Card hoverable style={{ textAlign: "center" as const }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: tokens.colors.humand[600] }}>{data.users.length}</div>
              <div style={{ fontSize: 12, color: tokens.semantic.textLighter, marginTop: 4 }}>{t.totalUsuarios}</div>
            </Card>
            <Card hoverable style={{ textAlign: "center" as const }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: tokens.colors.green[600] }}>{activeUsers}</div>
              <div style={{ fontSize: 12, color: tokens.semantic.textLighter, marginTop: 4 }}>{t.usuariosActivos}</div>
            </Card>
            <Card hoverable style={{ textAlign: "center" as const }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: tokens.colors.purple[500] }}>{fmtNum(avgCredits)}</div>
              <div style={{ fontSize: 12, color: tokens.semantic.textLighter, marginTop: 4 }}>{t.promCreditos}</div>
            </Card>
          </div>

          <Card noPadding>
            <div style={{ padding: "20px 24px", display: "flex", gap: 12, alignItems: "center" }}>
              <SearchInput value={search} onChange={setSearch} placeholder={t.buscar} />
              <Button variant="secondary" icon={Filter} size="md">Filtros</Button>
              <Button icon={Upload} onClick={() => setShowBulkModal(true)}>{t.cargaMasiva}</Button>
            </div>
            <div style={{ padding: "0 24px 24px" }}>
              <Table
                columns={[
                  { header: t.colaboradores, key: "name", render: (r: any) => (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar initials={r.avatar} size={32} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.2px" }}>{r.name}</div>
                        <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>{r.email}</div>
                      </div>
                    </div>
                  )},
                  { header: t.departamento, key: "dept", render: (r: any) => <Badge variant="neutral">{r.dept}</Badge> },
                  { header: t.cargados, key: "credits", render: (r: any) => fmtNum(r.credits) },
                  { header: t.canjeados, key: "spent", render: (r: any) => fmtNum(r.spent) },
                  { header: t.disponible, key: "available", render: (r: any) => {
                    const avail = r.credits - r.spent;
                    return <span style={{ fontWeight: 600, color: avail > 0 ? tokens.colors.green[600] : tokens.colors.red[500] }}>{fmtNum(avail)}</span>;
                  }},
                  { header: t.estado, key: "status", render: (r: any) => (
                    <Badge variant={r.status === "active" ? "success" : "error"}>{r.status === "active" ? t.activo : t.inactivo}</Badge>
                  )},
                  { header: t.acciones, key: "actions", render: (r: any) => (
                    <Button variant="secondary" size="sm" icon={Plus} onClick={() => { setSelected(r); setShowModal(true); }}>{t.cargar}</Button>
                  )},
                ]}
                data={filtered}
              />
            </div>
          </Card>

          {showModal && selected && (
            <Modal title={`${t.cargar} créditos a ${selected.name}`} onClose={() => { setShowModal(false); setSelected(null); }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: tokens.colors.neutral[50], borderRadius: tokens.radius.m, marginBottom: 20 }}>
                <Avatar initials={selected.avatar} size={40} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "0.2px" }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>{selected.email} · {selected.dept}</div>
                  <div style={{ fontSize: 12, color: tokens.colors.green[600], marginTop: 2, letterSpacing: "0.2px" }}>
                    {t.disponible}: {fmtNum(selected.credits - selected.spent)} {t.creditosLabel}
                  </div>
                </div>
              </div>
              <FormField label={t.monto}>
                <Input type="number" placeholder="Ej: 5" value={loadAmount} onChange={(e: any) => setLoadAmount(e.target.value)} />
              </FormField>
              <FormField label={t.motivo}>
                <Select value={loadReason} onChange={(e: any) => setLoadReason(e.target.value)} options={[
                  { value: "", label: "Seleccionar motivo..." },
                  { value: "bonus", label: "Bonus especial" },
                  { value: "adjustment", label: "Ajuste" },
                  { value: "compensation", label: "Compensación" },
                  { value: "other", label: "Otro" },
                ]} />
              </FormField>
              <FormField label={t.nota}>
                <Input placeholder="Comentario interno sobre la carga" value={loadNote} onChange={(e: any) => setLoadNote(e.target.value)} />
              </FormField>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
                <Button variant="secondary" onClick={() => { setShowModal(false); setSelected(null); }}>{t.cancelar}</Button>
                <Button icon={CreditCard} onClick={handleLoadCredits}>{loadingCredits ? "Cargando..." : t.cargar + " créditos"}</Button>
              </div>
            </Modal>
          )}

          {showBulkModal && (
            <Modal title={t.cargaMasiva} onClose={() => setShowBulkModal(false)} wide>
              <EmptyDrop label="Subí tu archivo CSV" />
              <div style={{ marginTop: 16, padding: 12, background: tokens.colors.info[50], borderRadius: tokens.radius.s, fontSize: 12, color: tokens.colors.info[700], letterSpacing: "0.2px", lineHeight: 1.4 }}>
                <strong>Formato esperado:</strong> El CSV debe contener las columnas: email, creditos.
              </div>
              <FormField label={t.monto}><Input type="number" placeholder="1500" /></FormField>
              <FormField label={t.motivo}><Input placeholder="Ej: Carga mensual marzo 2026" /></FormField>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
                <Button variant="secondary" onClick={() => setShowBulkModal(false)}>{t.cancelar}</Button>
                <Button icon={Upload} onClick={() => { toast.success("Carga masiva procesada exitosamente"); setShowBulkModal(false); }}>Procesar carga</Button>
              </div>
            </Modal>
          )}
        </div>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: COLABORADORES (standalone)
   ════════════════════════════════════════════ */
function ColaboradoresPage({ data, t, onRefresh }: { data: any; t: T; onRefresh: () => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [loadAmount, setLoadAmount] = useState("");
  const [loadReason, setLoadReason] = useState("");
  const [loadNote, setLoadNote] = useState("");
  const [loadingCredits, setLoadingCredits] = useState(false);

  const handleLoadCredits = async () => {
    if (!selected || !loadAmount || Number(loadAmount) <= 0) return;
    setLoadingCredits(true);
    try {
      const reasons: Record<string, string> = { bonus: "Bonus especial", adjustment: "Ajuste", compensation: "Compensación", other: "Otro" };
      const desc = (reasons[loadReason] || "Carga manual") + (loadNote ? ` - ${loadNote}` : "");
      const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", selected.id).single();
      if (!wallet) throw new Error("Wallet not found");
      const newBalance = Math.round((Number(wallet.balance) + Number(loadAmount)) * 100) / 100;
      await supabase.from("wallets").update({ balance: newBalance, updated_at: new Date().toISOString() }).eq("id", wallet.id);
      await supabase.from("transactions").insert({ user_id: selected.id, wallet_id: wallet.id, type: "credit", amount: Number(loadAmount), description: desc });
      toast.success(`Se cargaron ${loadAmount} créditos a ${selected.name}`);
      setShowModal(false); setSelected(null); setLoadAmount(""); setLoadReason(""); setLoadNote(""); onRefresh();
    } catch (e) { console.error(e); toast.error("Error al cargar créditos"); }
    setLoadingCredits(false);
  };

  const filtered = data.users.filter((u: any) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.dept || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{t.colaboradores}</h1>
          <p style={{ ...baseStyles, fontSize: 14, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>{t.gestionaCreditos}</p>
        </div>
        <Button icon={Upload} onClick={() => setShowBulkModal(true)}>{t.cargaMasiva}</Button>
      </div>

      <Card noPadding>
        <div style={{ padding: "20px 24px", display: "flex", gap: 12, alignItems: "center" }}>
          <SearchInput value={search} onChange={setSearch} placeholder={t.buscar} />
          <Button variant="secondary" icon={Filter} size="md">Filtros</Button>
        </div>
        <div style={{ padding: "0 24px 24px" }}>
          <Table
            columns={[
              { header: t.colaboradores, key: "name", render: (r: any) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar initials={r.avatar} size={32} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.2px" }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>{r.email}</div>
                  </div>
                </div>
              )},
              { header: t.departamento, key: "dept", render: (r: any) => <Badge variant="neutral">{r.dept}</Badge> },
              { header: t.cargados, key: "credits", render: (r: any) => fmtNum(r.credits) },
              { header: t.canjeados, key: "spent", render: (r: any) => fmtNum(r.spent) },
              { header: t.disponible, key: "available", render: (r: any) => {
                const avail = r.credits - r.spent;
                return <span style={{ fontWeight: 600, color: avail > 0 ? tokens.colors.green[600] : tokens.colors.red[500] }}>{fmtNum(avail)}</span>;
              }},
              { header: t.estado, key: "status", render: (r: any) => (
                <Badge variant={r.status === "active" ? "success" : "error"}>{r.status === "active" ? t.activo : t.inactivo}</Badge>
              )},
              { header: t.acciones, key: "actions", render: (r: any) => (
                <Button variant="secondary" size="sm" icon={Plus} onClick={() => { setSelected(r); setShowModal(true); }}>{t.cargar}</Button>
              )},
            ]}
            data={filtered}
          />
        </div>
      </Card>

      {showModal && selected && (
        <Modal title={`${t.cargar} créditos a ${selected.name}`} onClose={() => { setShowModal(false); setSelected(null); }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: tokens.colors.neutral[50], borderRadius: tokens.radius.m, marginBottom: 20 }}>
            <Avatar initials={selected.avatar} size={40} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{selected.name}</div>
              <div style={{ fontSize: 12, color: tokens.semantic.textLighter }}>{selected.email} · {selected.dept}</div>
              <div style={{ fontSize: 12, color: tokens.colors.green[600], marginTop: 2 }}>{t.disponible}: {fmtNum(selected.credits - selected.spent)} {t.creditosLabel}</div>
            </div>
          </div>
          <FormField label={t.monto}><Input type="number" placeholder="Ej: 5" value={loadAmount} onChange={(e: any) => setLoadAmount(e.target.value)} /></FormField>
          <FormField label={t.motivo}><Select value={loadReason} onChange={(e: any) => setLoadReason(e.target.value)} options={[{ value: "", label: "Seleccionar motivo..." }, { value: "bonus", label: "Bonus especial" }, { value: "adjustment", label: "Ajuste" }, { value: "compensation", label: "Compensación" }, { value: "other", label: "Otro" }]} /></FormField>
          <FormField label={t.nota}><Input placeholder="Comentario interno" value={loadNote} onChange={(e: any) => setLoadNote(e.target.value)} /></FormField>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <Button variant="secondary" onClick={() => { setShowModal(false); setSelected(null); }}>{t.cancelar}</Button>
            <Button icon={CreditCard} onClick={handleLoadCredits}>{loadingCredits ? "Cargando..." : t.cargar + " créditos"}</Button>
          </div>
        </Modal>
      )}

      {showBulkModal && (
        <Modal title={t.cargaMasiva} onClose={() => setShowBulkModal(false)} wide>
          <EmptyDrop label="Subí tu archivo CSV" />
          <div style={{ marginTop: 16, padding: 12, background: tokens.colors.info[50], borderRadius: tokens.radius.s, fontSize: 12, color: tokens.colors.info[700], lineHeight: 1.4 }}>
            <strong>Formato esperado:</strong> El CSV debe contener las columnas: email, creditos.
          </div>
          <FormField label={t.monto}><Input type="number" placeholder="1500" /></FormField>
          <FormField label={t.motivo}><Input placeholder="Ej: Carga mensual" /></FormField>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <Button variant="secondary" onClick={() => setShowBulkModal(false)}>{t.cancelar}</Button>
            <Button icon={Upload} onClick={() => { toast.success("Carga masiva procesada exitosamente"); setShowBulkModal(false); }}>Procesar carga</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: BENEFITS MANAGEMENT
   ════════════════════════════════════════════ */
const BENEFIT_CATALOG = [
  { name: "Gimnasio SmartFit", category: "salud", provider: "SmartFit", cost: 8, description: "Acceso mensual a cualquier sede SmartFit", image: "🏋️" },
  { name: "Sesión de nutrición", category: "salud", provider: "NutriPlan", cost: 5, description: "Consulta personalizada con nutricionista", image: "🥗" },
  { name: "Clase de yoga", category: "bienestar", provider: "ZenFlow", cost: 3, description: "Clase grupal de yoga y meditación", image: "🧘" },
  { name: "Día de spa", category: "bienestar", provider: "RelaxSpa", cost: 10, description: "Jornada de relajación y masajes", image: "💆" },
  { name: "Almuerzo gourmet", category: "gastronomía", provider: "FoodBox", cost: 4, description: "Almuerzo saludable delivery", image: "🍕" },
  { name: "Coffee break premium", category: "gastronomía", provider: "CaféSelect", cost: 2, description: "Café de especialidad y snacks", image: "☕" },
  { name: "Curso de inglés", category: "educación", provider: "LangPro", cost: 7, description: "Mes de clases de inglés online", image: "📚" },
  { name: "Curso Udemy", category: "educación", provider: "Udemy", cost: 5, description: "Acceso a un curso en Udemy Business", image: "🎓" },
  { name: "Entrada de cine", category: "entretenimiento", provider: "Cinemark", cost: 3, description: "Entrada para cualquier función", image: "🎬" },
  { name: "Streaming mensual", category: "entretenimiento", provider: "Multi", cost: 4, description: "Netflix, Spotify o Disney+", image: "📺" },
  { name: "Gift card shopping", category: "shopping", provider: "MercadoLibre", cost: 10, description: "Gift card canjeable en MercadoLibre", image: "🛍️" },
  { name: "Día libre", category: "bienestar", provider: "Interno", cost: 15, description: "Un día libre adicional", image: "🏖️" },
];

function BenefitsPage({ data, t }: { data: any; t: T }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [catFilter, setCatFilter] = useState("all");

  const categories = [
    { key: "all", label: t.todos },
    { key: "salud", label: t.salud },
    { key: "educacion", label: t.educacion },
    { key: "gastronomia", label: t.gastronomia },
    { key: "entretenimiento", label: t.entretenimiento },
    { key: "bienestar", label: t.bienestar },
  ];

  const filtered = data.benefits.filter((b: any) => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || (b.category || "").toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter === "all" || (b.category || "").toLowerCase().includes(catFilter);
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{t.gestionBeneficios}</h1>
          <p style={{ ...baseStyles, fontSize: 14, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>{t.adminCatalogo}</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>{t.nuevoBeneficio}</Button>
      </div>

      {/* Category filter buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" as const }}>
        {categories.map(cat => (
          <button key={cat.key} onClick={() => setCatFilter(cat.key)} style={{
            ...baseStyles, padding: "6px 16px", fontSize: 13, fontWeight: catFilter === cat.key ? 600 : 400,
            background: catFilter === cat.key ? tokens.colors.humand[500] : "#fff",
            color: catFilter === cat.key ? "#fff" : tokens.semantic.textLighter,
            border: `1px solid ${catFilter === cat.key ? tokens.colors.humand[500] : tokens.semantic.border}`,
            borderRadius: 999, cursor: "pointer", transition: tokens.transition.fast,
          }}>
            {cat.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
        <SearchInput value={search} onChange={setSearch} placeholder={t.buscar} />
        <Button variant={viewMode === "grid" ? "primary" : "secondary"} size="sm" icon={Layers} onClick={() => setViewMode("grid")} />
        <Button variant={viewMode === "list" ? "primary" : "secondary"} size="sm" icon={FileText} onClick={() => setViewMode("list")} />
      </div>

      {viewMode === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {filtered.map((b: any) => (
            <Card key={b.id} hoverable style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ fontSize: 40, lineHeight: 1 }}>{b.image}</div>
                <Badge variant={b.status === "active" ? "success" : "warning"}>{b.status === "active" ? t.activo : t.pausado}</Badge>
              </div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, letterSpacing: "0.2px", lineHeight: 1.4 }}>{b.name}</div>
              <div style={{ fontSize: 12, color: tokens.semantic.textLighter, marginBottom: 12, letterSpacing: "0.2px" }}>{b.category} · {b.provider}</div>
              {/* Prominent credit cost */}
              <div style={{ background: tokens.colors.humand[50], borderRadius: tokens.radius.m, padding: "8px 12px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <CreditCard size={18} color={tokens.colors.humand[600]} />
                <span style={{ fontWeight: 700, fontSize: 20, color: tokens.colors.humand[600] }}>{b.credits}</span>
                <span style={{ fontSize: 12, color: tokens.semantic.textLighter }}>{t.creditosLabel}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, color: tokens.semantic.textLighter }}>{b.redemptions} {t.canjesLabel}</div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Button variant="secondary" size="sm" icon={Edit3} style={{ flex: 1 }}>{t.editarBenef}</Button>
                <Button variant="ghost" size="sm" icon={Eye}>{t.verBenef}</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card noPadding>
          <div style={{ padding: "16px 24px" }}>
            <Table
              columns={[
                { header: t.beneficios, key: "name", render: (r: any) => (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{r.image}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: tokens.semantic.textLighter }}>{r.provider}</div>
                    </div>
                  </div>
                )},
                { header: t.categoria, key: "category", render: (r: any) => <Badge>{r.category}</Badge> },
                { header: t.creditosLabel, key: "credits", render: (r: any) => <span style={{ fontWeight: 600 }}>{r.credits}</span> },
                { header: t.canjesLabel, key: "redemptions" },
                { header: t.estado, key: "status", render: (r: any) => <Badge variant={r.status === "active" ? "success" : "warning"}>{r.status === "active" ? t.activo : t.pausado}</Badge> },
                { header: t.acciones, key: "actions", render: () => (
                  <div style={{ display: "flex", gap: 4 }}>
                    <Button variant="ghost" size="sm" icon={Edit3} />
                    <Button variant="ghost" size="sm" icon={Trash2} />
                  </div>
                )},
              ]}
              data={filtered}
            />
          </div>
        </Card>
      )}

      {showModal && (
        <Modal title={t.nuevoBeneficio} onClose={() => setShowModal(false)} wide>
          <FormField label="Nombre del beneficio"><Input placeholder="Ej: Gimnasio mensual" /></FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormField label={t.categoria}>
              <Select options={[
                { value: "", label: "Seleccionar..." },
                { value: "wellness", label: t.bienestar }, { value: "education", label: t.educacion },
                { value: "food", label: t.gastronomia }, { value: "entertainment", label: t.entretenimiento },
                { value: "health", label: t.salud },
              ]} />
            </FormField>
            <FormField label={t.proveedor}><Input placeholder="Ej: SmartFit" /></FormField>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormField label={t.costoCreditos}><Input type="number" placeholder="Ej: 500" /></FormField>
            <FormField label={t.stock}><Input type="number" placeholder="Ilimitado si se deja vacío" /></FormField>
          </div>
          <FormField label={t.segmentar}>
            <Select options={[
              { value: "all", label: t.todos }, { value: "marketing", label: "Marketing" },
              { value: "tech", label: "Tecnología" }, { value: "hr", label: "RRHH" },
              { value: "sales", label: "Ventas" }, { value: "finance", label: "Finanzas" },
            ]} />
          </FormField>
          <FormField label={t.descripcion}>
            <textarea placeholder="Describí el beneficio..." style={{ ...baseStyles, width: "100%", padding: "10px 12px", minHeight: 80, border: `1px solid ${tokens.semantic.border}`, borderRadius: tokens.radius.s, fontSize: 14, lineHeight: 1.4, outline: "none", resize: "vertical" as const, boxSizing: "border-box" as const }} />
          </FormField>
          <FormField label={t.imagenEmoji}><Input placeholder="Ej: 🏋️ o URL de imagen" /></FormField>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>{t.cancelar}</Button>
            <Button icon={Plus} onClick={() => { toast.success("Beneficio creado exitosamente"); setShowModal(false); }}>{t.crearBeneficio}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: AUTO RULES (simplified)
   ════════════════════════════════════════════ */
function RuleRow({ rule, t }: { rule: any; t: T }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, borderTop: `1px solid ${tokens.semantic.borderLight}`, borderRight: `1px solid ${tokens.semantic.borderLight}`, borderBottom: `1px solid ${tokens.semantic.borderLight}`, borderLeft: `1px solid ${tokens.semantic.borderLight}`, borderRadius: tokens.radius.m, background: rule.status === "paused" ? tokens.colors.neutral[50] : "#fff" }}>
      <div style={{ width: 40, height: 40, borderRadius: tokens.radius.m, background: rule._isGeneration ? tokens.colors.purple[50] : tokens.colors.humand[50], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {rule._isGeneration ? <Sparkles size={20} color={tokens.colors.purple[600]} /> : rule.type === "periodic" ? <Repeat size={20} color={tokens.colors.humand[600]} /> : <Gift size={20} color={tokens.colors.humand[600]} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{rule.name}</span>
          <Badge variant={rule.status === "active" ? "success" : "warning"}>{rule.status === "active" ? t.activa : t.pausada}</Badge>
        </div>
        <div style={{ fontSize: 12, color: tokens.semantic.textLighter, marginTop: 4 }}>
          {t.trigger}: {rule.trigger} · {fmtNum(rule.amount)} {t.creditosLabel}{rule.target ? ` · ${rule.target}` : ""}
        </div>
        <div style={{ fontSize: 11, color: tokens.semantic.textDisabled, marginTop: 2 }}>{t.ultimaEjecucion}: {rule.lastRun}</div>
      </div>
      <div onClick={() => toast.success(rule.status === "active" ? "Regla pausada" : "Regla activada")}
        style={{ width: 44, height: 24, borderRadius: 12, background: rule.status === "active" ? tokens.colors.green[500] : tokens.colors.neutral[300], cursor: "pointer", position: "relative" as const, transition: tokens.transition.fast, flexShrink: 0 }}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute" as const, top: 3, left: rule.status === "active" ? 23 : 3, transition: tokens.transition.fast, boxShadow: tokens.shadow.dp2 }} />
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <Button variant="ghost" size="sm" icon={Edit3} />
        <Button variant="ghost" size="sm" icon={Trash2} />
      </div>
    </div>
  );
}

function AutoRulesPage({ data, t }: { data: any; t: T }) {
  const { autoRules } = data;
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState("assignment");
  const [modalType, setModalType] = useState<"assignment" | "generation">("assignment");

  const assignmentRules = autoRules.filter((r: any) => r.type === "periodic" || ["Cumpleaños", "Aniversario", "Alta de usuario"].includes(r.trigger));

  // Generation rules: examples that connect with learning/courses
  const generationRules = [
    { id: "gen_1", name: "Completar curso de capacitación", type: "event", trigger: "Curso completado", amount: 5, target: "", status: "active", lastRun: "17/03/2026", _isGeneration: true },
    { id: "gen_2", name: "Aprobar evaluación de desempeño", type: "event", trigger: "Evaluación aprobada", amount: 10, target: "", status: "active", lastRun: "01/03/2026", _isGeneration: true },
    { id: "gen_3", name: "Referir candidato contratado", type: "event", trigger: "Referido contratado", amount: 20, target: "", status: "active", lastRun: "10/03/2026", _isGeneration: true },
    { id: "gen_4", name: "Completar lección de Learning", type: "event", trigger: "Lección completada", amount: 2, target: "", status: "paused", lastRun: "—", _isGeneration: true },
  ];

  const currentRules = tab === "assignment" ? assignmentRules : generationRules;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{t.reglasAutomaticas}</h1>
          <p style={{ ...baseStyles, fontSize: 14, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>
            {tab === "assignment" ? "Reglas para distribuir créditos a colaboradores" : "Reglas para generar créditos cuando se cumplen logros"}
          </p>
        </div>
        <Button icon={Plus} onClick={() => { setModalType(tab as any); setShowModal(true); }}>{t.crearRegla}</Button>
      </div>

      <Tabs tabs={[{ key: "assignment", label: t.reglasAsignacion }, { key: "generation", label: t.reglasGeneracion }]} active={tab} onChange={setTab} />

      {/* Info banner for generation tab */}
      {tab === "generation" && (
        <div style={{ padding: 16, background: tokens.colors.purple[50], borderRadius: tokens.radius.m, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <Sparkles size={20} color={tokens.colors.purple[500]} />
          <div style={{ fontSize: 13, color: tokens.colors.purple[600], lineHeight: 1.5 }}>
            <strong>Reglas de generación</strong> otorgan créditos automáticamente cuando los colaboradores completan logros como cursos, lecciones, evaluaciones o referidos.
          </div>
        </div>
      )}

      <Card noPadding>
        <div style={{ padding: "16px 24px" }}>
          {currentRules.length === 0 ? (
            <div style={{ textAlign: "center" as const, padding: 40, color: tokens.semantic.textLighter }}>
              <Zap size={32} style={{ marginBottom: 8, color: tokens.semantic.textDisabled }} />
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No hay reglas configuradas</div>
              <Button variant="secondary" icon={Plus} onClick={() => { setModalType(tab as any); setShowModal(true); }} style={{ marginTop: 12 }}>{t.crearRegla}</Button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {currentRules.map((rule: any) => <RuleRow key={rule.id} rule={rule} t={t} />)}
            </div>
          )}
        </div>
      </Card>

      {/* Modal with DIFFERENT inputs based on type */}
      {showModal && (
        <Modal title={modalType === "assignment" ? "Nueva regla de asignación" : "Nueva regla de generación"} onClose={() => setShowModal(false)} wide>
          <FormField label="Nombre de la regla">
            <Input placeholder={modalType === "assignment" ? "Ej: Bonus de cumpleaños" : "Ej: Completar curso de Learning"} />
          </FormField>

          {modalType === "assignment" ? (
            <>
              {/* ASSIGNMENT-specific inputs */}
              <FormField label="Tipo de trigger">
                <Select options={[
                  { value: "", label: "Seleccionar tipo..." },
                  { value: "periodic", label: "Periódico (diario, semanal, mensual)" },
                  { value: "birthday", label: "Evento: Cumpleaños" },
                  { value: "anniversary", label: "Evento: Aniversario laboral" },
                  { value: "onboarding", label: "Evento: Alta de usuario" },
                ]} />
              </FormField>
              <FormField label="Periodicidad (si aplica)">
                <Select options={[
                  { value: "", label: "Seleccionar..." },
                  { value: "daily", label: "Diario" }, { value: "weekly", label: "Semanal" },
                  { value: "monthly", label: "Mensual" }, { value: "quarterly", label: "Trimestral" },
                ]} />
              </FormField>
              <FormField label="Créditos a asignar"><Input type="number" placeholder="Ej: 20" /></FormField>
              <FormField label="Aplicar a">
                <Select options={[
                  { value: "all", label: "Todos los colaboradores" },
                  { value: "dept", label: "Por departamento" },
                  { value: "group", label: "Grupo específico" },
                ]} />
              </FormField>
              <FormField label="Fecha de expiración (opcional)"><Input type="date" /></FormField>
            </>
          ) : (
            <>
              {/* GENERATION-specific inputs */}
              <FormField label="Evento que genera créditos">
                <Select options={[
                  { value: "", label: "Seleccionar evento..." },
                  { value: "course_complete", label: "Completar un curso" },
                  { value: "lesson_complete", label: "Completar una lección de Learning" },
                  { value: "eval_approved", label: "Aprobar evaluación de desempeño" },
                  { value: "referral_hired", label: "Referir candidato que es contratado" },
                  { value: "survey_complete", label: "Completar encuesta interna" },
                  { value: "custom", label: "Evento personalizado" },
                ]} />
              </FormField>
              <FormField label="Créditos a otorgar por logro"><Input type="number" placeholder="Ej: 5" /></FormField>
              <div style={{ padding: 12, background: tokens.colors.info[50], borderRadius: tokens.radius.s, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: tokens.colors.info[700], lineHeight: 1.5 }}>
                  <strong>Conexión con Learning:</strong> Si seleccionás "Completar un curso" o "Completar lección", los créditos se otorgan automáticamente cuando el colaborador finaliza el contenido en la plataforma de Learning.
                </div>
              </div>
              <FormField label="Límite por colaborador (opcional)">
                <Select options={[
                  { value: "unlimited", label: "Sin límite" },
                  { value: "1_per_day", label: "1 vez por día" },
                  { value: "1_per_week", label: "1 vez por semana" },
                  { value: "1_per_month", label: "1 vez por mes" },
                  { value: "1_total", label: "Solo 1 vez" },
                ]} />
              </FormField>
              <FormField label="Máximo de créditos acumulables (opcional)">
                <Input type="number" placeholder="Ej: 50 (dejar vacío = sin límite)" />
              </FormField>
            </>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>{t.cancelar}</Button>
            <Button icon={Zap} onClick={() => { toast.success(modalType === "assignment" ? "Regla de asignación creada" : "Regla de generación creada"); setShowModal(false); }}>{t.crearRegla}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: BUY CREDITS
   ════════════════════════════════════════════ */
function BuyCreditsPage({ data, t }: { data: any; t: T }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const pricePerCredit = 0.10;
  const total = amount ? Number(amount) * pricePerCredit : 0;
  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{t.comprarCreditosTitulo}</h1>
        <p style={{ ...baseStyles, fontSize: 14, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>{t.comprarCreditosDesc}</p>
      </div>

      {/* Current balance */}
      <Card style={{ marginBottom: 24, background: `linear-gradient(135deg, ${tokens.colors.humand[50]}, ${tokens.colors.purple[50]})` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, color: tokens.semantic.textLighter, marginBottom: 4 }}>{t.creditosDisponibles}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: tokens.colors.humand[600] }}>{fmtCurrency(data.totalPending)}</div>
          </div>
          <div style={{ textAlign: "right" as const }}>
            <div style={{ fontSize: 13, color: tokens.semantic.textLighter, marginBottom: 4 }}>{t.creditosAsignados}</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{fmtCurrency(data.totalCredited)}</div>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* Left: add credits form */}
        <Card>
          <h3 style={{ ...baseStyles, fontSize: 18, fontWeight: 600, margin: "0 0 24px 0" }}>{t.sumarCreditos}</h3>

          {/* Quick select */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: tokens.semantic.textLighter, marginBottom: 10 }}>{t.montoRapido}</div>
            <div style={{ display: "flex", gap: 10 }}>
              {quickAmounts.map(q => (
                <button key={q} onClick={() => setAmount(String(q))}
                  style={{
                    flex: 1, padding: "14px 8px", textAlign: "center" as const,
                    borderRadius: tokens.radius.m, cursor: "pointer",
                    background: amount === String(q) ? tokens.colors.humand[500] : "#fff",
                    color: amount === String(q) ? "#fff" : tokens.semantic.textDefault,
                    borderTop: `2px solid ${amount === String(q) ? tokens.colors.humand[500] : tokens.semantic.border}`,
                    borderRight: `2px solid ${amount === String(q) ? tokens.colors.humand[500] : tokens.semantic.border}`,
                    borderBottom: `2px solid ${amount === String(q) ? tokens.colors.humand[500] : tokens.semantic.border}`,
                    borderLeft: `2px solid ${amount === String(q) ? tokens.colors.humand[500] : tokens.semantic.border}`,
                    fontFamily: "Roboto", fontWeight: 700, fontSize: 16,
                    transition: tokens.transition.fast,
                  }}>
                  {fmtNum(q)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <FormField label={t.cantidadPersonalizada}>
            <Input type="number" placeholder="Ej: 3000" value={amount} onChange={(e: any) => setAmount(e.target.value)} />
          </FormField>
          <FormField label={`${t.nota} (${t.opcional})`}>
            <Input placeholder="Ej: Compra Q2 2026" value={note} onChange={(e: any) => setNote(e.target.value)} />
          </FormField>

          {/* Price breakdown */}
          {amount && Number(amount) > 0 && (
            <div style={{ padding: 16, background: tokens.colors.neutral[50], borderRadius: tokens.radius.m, marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: tokens.semantic.textLighter }}>
                <span>{fmtNum(Number(amount))} créditos × {fmtCurrency(pricePerCredit)}</span>
                <span>{fmtCurrency(total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${tokens.semantic.borderLight}`, fontSize: 16, fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: tokens.colors.humand[600] }}>{fmtCurrency(total)}</span>
              </div>
            </div>
          )}

          <Button variant="gradient" icon={ShoppingCart} size="lg"
            style={{ width: "100%", justifyContent: "center", marginTop: 20 }}
            onClick={() => { if (!amount || Number(amount) <= 0) { toast.error("Ingresá una cantidad"); return; } toast.success(`${fmtNum(Number(amount))} créditos agregados a tu cuenta`); setAmount(""); setNote(""); }}>
            {t.sumarCreditos}
          </Button>
        </Card>

        {/* Right: summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ background: tokens.colors.humand[50] }}>
            <h4 style={{ ...baseStyles, fontSize: 14, fontWeight: 600, margin: "0 0 12px 0" }}>{t.resumenCompra}</h4>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: tokens.semantic.textLighter }}>{t.creditosLabel}</span>
              <span style={{ fontSize: 28, fontWeight: 700, color: tokens.colors.humand[600] }}>{amount ? fmtNum(Number(amount)) : "0"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${tokens.colors.humand[200]}` }}>
              <span style={{ fontSize: 13, color: tokens.semantic.textLighter }}>Costo</span>
              <span style={{ fontSize: 22, fontWeight: 700 }}>{fmtCurrency(total)}</span>
            </div>
          </Card>

          <Card>
            <h4 style={{ ...baseStyles, fontSize: 14, fontWeight: 600, margin: "0 0 12px 0" }}>{t.preciosReferencia}</h4>
            {[{ qty: 100, price: 10 }, { qty: 500, price: 50 }, { qty: 1000, price: 100 }, { qty: 5000, price: 500 }].map(({ qty, price }) => (
              <div key={qty} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${tokens.semantic.borderLight}`, fontSize: 13 }}>
                <span style={{ color: tokens.semantic.textLighter }}>{fmtNum(qty)} créditos</span>
                <span style={{ fontWeight: 600 }}>{fmtCurrency(price)}</span>
              </div>
            ))}
            <div style={{ fontSize: 11, color: tokens.semantic.textDisabled, marginTop: 8 }}>{fmtCurrency(pricePerCredit)} por crédito</div>
          </Card>
        </div>
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════
   SIDEBAR & APP SHELL
   ════════════════════════════════════════════ */
const benefitsSubNav = [
  { key: "dashboard", label: "Dashboard" },
  { key: "individual", label: "Colaboradores" },
  { key: "benefits", label: "Beneficios" },
  { key: "auto", label: "Reglas automáticas" },
  { key: "buy", label: "Comprar créditos" },
];

const otherNav = [
  { key: "statistics", label: "Estadísticas", icon: BarChart3 },
  { key: "users", label: "Usuarios", icon: Users },
  { key: "groups", label: "Grupos", icon: Layers },
  { key: "segments", label: "Segmentación", icon: Filter },
  { key: "regions", label: "Regiones y sedes", icon: Globe },
  { key: "schedule", label: "Horarios laborales", icon: Calendar },
  { key: "news", label: "Noticias", icon: FileText },
  { key: "knowledge", label: "Librerías de conocimiento", icon: Layers },
  { key: "forms", label: "Formularios y Trámites", icon: FileText },
  { key: "settings", label: "Configuración", icon: Settings },
];

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [benefitsOpen, setBenefitsOpen] = useState(true);
  const [lang, setLang] = useState<Lang>("es");
  const data = useAdminData();
  const t = i18n[lang];

  const isBenefitsPage = benefitsSubNav.some(s => s.key === activePage);

  // Localized sub-nav labels
  const localizedSubNav = [
    { key: "dashboard", label: t.dashboard },
    { key: "individual", label: t.colaboradores },
    { key: "benefits", label: t.beneficios },
    { key: "auto", label: t.reglasAutomaticas },
    { key: "buy", label: t.comprar },
  ];

  if (data.loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: tokens.semantic.bgPage, ...baseStyles }}>
        <div style={{ textAlign: "center" as const, animation: "fadeIn 0.5s ease-out" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${tokens.colors.humand[500]}, ${tokens.colors.purple[500]})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, margin: "0 auto 20px", letterSpacing: "0.2px", animation: "pulse 1.5s ease-in-out infinite", boxShadow: tokens.shadow.glow }}>hu</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: tokens.semantic.textDefault, marginBottom: 6 }}>Cargando datos...</div>
          <div style={{ fontSize: 13, color: tokens.semantic.textLighter }}>Conectando con la base de datos</div>
          <div style={{ width: 120, height: 3, borderRadius: 2, margin: "16px auto 0", background: tokens.colors.neutral[150], overflow: "hidden" }}>
            <div style={{ width: "40%", height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${tokens.colors.humand[400]}, ${tokens.colors.purple[400]})`, animation: "shimmer 1.5s ease-in-out infinite", backgroundSize: "200% 100%" }} />
          </div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage data={data} t={t} onNavigate={setActivePage} onRefresh={data.refresh} />;
      case "individual": return <ColaboradoresPage data={data} t={t} onRefresh={data.refresh} />;
      case "auto": return <AutoRulesPage data={data} t={t} />;
      case "benefits": return <BenefitsPage data={data} t={t} />;
      case "buy": return <BuyCreditsPage data={data} t={t} />;
      default: return <DashboardPage data={data} t={t} onNavigate={setActivePage} onRefresh={data.refresh} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: tokens.semantic.bgPage, ...baseStyles }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarCollapsed ? 72 : 260, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRight: `1px solid ${tokens.semantic.borderLight}`, display: "flex", flexDirection: "column", transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)", flexShrink: 0, position: "sticky" as const, top: 0, height: "100vh", overflowY: "auto" as const }}>
        {/* Logo */}
        <div style={{ padding: sidebarCollapsed ? "20px 16px" : "20px 24px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${tokens.semantic.borderLight}` }}>
          <div style={{ width: 36, height: 36, borderRadius: tokens.radius.m, background: `linear-gradient(135deg, ${tokens.colors.humand[500]}, ${tokens.colors.purple[500]})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 14, flexShrink: 0, letterSpacing: "0.2px" }}>hu</div>
          {!sidebarCollapsed && (
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: "0.2px", lineHeight: 1.4 }}>Perks</div>
              <Badge variant="default">Admin</Badge>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" as const }}>
          {otherNav.slice(0, 6).map(item => {
            const Icon = item.icon;
            return (
              <button key={item.key} onClick={() => {}} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: sidebarCollapsed ? "10px 0" : "10px 12px", justifyContent: sidebarCollapsed ? "center" : "flex-start", background: "transparent", color: tokens.semantic.textLighter, border: "none", borderRadius: tokens.radius.s, cursor: "pointer", fontSize: 14, fontWeight: 400, marginBottom: 2, fontFamily: "Roboto", letterSpacing: "0.2px", transition: "all 0.15s ease" }}>
                <Icon size={20} />
                {!sidebarCollapsed && item.label}
              </button>
            );
          })}

          {/* Beneficios collapsible group */}
          <div style={{ margin: "4px 0", background: benefitsOpen ? tokens.colors.neutral[50] : "transparent", borderRadius: tokens.radius.m, transition: "background 0.2s ease" }}>
            <button onClick={() => { setBenefitsOpen(!benefitsOpen); if (!benefitsOpen && !isBenefitsPage) setActivePage("dashboard"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: sidebarCollapsed ? "10px 0" : "10px 12px", justifyContent: sidebarCollapsed ? "center" : "flex-start", background: "transparent", color: isBenefitsPage ? tokens.colors.humand[600] : tokens.semantic.textLighter, border: "none", borderRadius: tokens.radius.s, cursor: "pointer", fontSize: 14, fontWeight: isBenefitsPage ? 600 : 400, fontFamily: "Roboto", letterSpacing: "0.2px", transition: "all 0.15s ease" }}>
              <Gift size={20} />
              {!sidebarCollapsed && (
                <>
                  <span style={{ flex: 1, textAlign: "left" as const }}>{t.beneficios}</span>
                  <ChevronDown size={16} style={{ transition: "transform 0.2s ease", transform: benefitsOpen ? "rotate(0deg)" : "rotate(-90deg)" }} />
                </>
              )}
            </button>

            {benefitsOpen && !sidebarCollapsed && (
              <div style={{ padding: "0 0 8px 0" }}>
                {localizedSubNav.map(sub => {
                  const isActive = activePage === sub.key;
                  return (
                    <button key={sub.key} onClick={() => setActivePage(sub.key)} style={{ width: "100%", display: "flex", alignItems: "center", padding: "8px 12px 8px 44px", textAlign: "left" as const, background: "transparent", color: isActive ? tokens.colors.humand[600] : tokens.semantic.textLighter, border: "none", cursor: "pointer", fontSize: 14, fontWeight: isActive ? 600 : 400, fontFamily: "Roboto", letterSpacing: "0.2px", borderRadius: tokens.radius.s, transition: "all 0.15s ease" }}>
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {otherNav.slice(6).map(item => {
            const Icon = item.icon;
            return (
              <button key={item.key} onClick={() => {}} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: sidebarCollapsed ? "10px 0" : "10px 12px", justifyContent: sidebarCollapsed ? "center" : "flex-start", background: "transparent", color: tokens.semantic.textLighter, border: "none", borderRadius: tokens.radius.s, cursor: "pointer", fontSize: 14, fontWeight: 400, marginBottom: 2, fontFamily: "Roboto", letterSpacing: "0.2px", transition: "all 0.15s ease" }}>
                <Icon size={20} />
                {!sidebarCollapsed && item.label}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ padding: 16, background: "none", borderTop: `1px solid ${tokens.semantic.borderLight}`, borderRight: "none", borderBottom: "none", borderLeft: "none", cursor: "pointer", color: tokens.semantic.textLighter, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 12, fontFamily: "Roboto", letterSpacing: "0.2px" }}>
          {sidebarCollapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> Colapsar</>}
        </button>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: tokens.semantic.bgPage }}>
        {/* Top bar */}
        <header style={{ height: 56, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky" as const, top: 0, zIndex: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>
              Plataforma de Beneficios Corporativos
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Language toggle */}
            <button onClick={() => setLang(lang === "es" ? "en" : "es")} style={{
              ...baseStyles, display: "flex", alignItems: "center", gap: 6,
              background: tokens.colors.humand[50], border: `1px solid ${tokens.colors.humand[200]}`,
              borderRadius: 999, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600,
              color: tokens.colors.humand[600], transition: tokens.transition.fast,
            }}>
              <Globe size={14} />
              {lang === "es" ? "ES" : "EN"}
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: tokens.semantic.textLighter, padding: 4 }}><HelpCircle size={20} /></button>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: tokens.semantic.textLighter, padding: 4 }}><Bell size={20} /></button>
            <Avatar initials="FC" size={32} />
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: 32, minHeight: "calc(100vh - 56px)" }}>
          <div key={activePage} style={{ maxWidth: 1200, animation: "fadeInUp 0.25s ease-out" }}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
