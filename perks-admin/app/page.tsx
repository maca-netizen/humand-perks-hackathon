"use client"

// Safe number formatter — avoids hydration mismatch between server/client
function fmtNum(n: number): string { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }

import { useState, useMemo } from "react";
import {
  BarChart3, Users, Gift, CreditCard, Upload, UserPlus, Zap,
  Settings, TrendingUp, Search, Plus, Trash2, Edit3, Check,
  X, ChevronDown, ChevronRight, Calendar, Clock, Award,
  DollarSign, ArrowUpRight, ArrowDownRight, Filter, Download,
  Eye, MoreVertical, Bell, Globe, HelpCircle, Star, Repeat,
  FileText, AlertCircle, CheckCircle, ChevronLeft, Home,
  Layers, LayoutDashboard, Package, PieChart, UserCheck, Sparkles
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie,
  Cell, Area, AreaChart, Legend
} from "recharts";

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
    dp4: "-1px 4px 8px 0px rgba(233,233,244,1)",
    dp8: "-1px 8px 16px 0px rgba(170,170,186,0.45)",
  },
  radius: { s: 4, m: 8, l: 16 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40 },
};

/* ════════════════════════════════════════════
   MOCK DATA
   ════════════════════════════════════════════ */
const mockUsers = [
  { id: 1, name: "Maria Garcia", email: "maria@novatech.com", dept: "Marketing", credits: 20, spent: 0, avatar: "MG", status: "active" },
  { id: 2, name: "Juan Perez", email: "juan@novatech.com", dept: "Tecnologia", credits: 20, spent: 0, avatar: "JP", status: "active" },
  { id: 3, name: "Ana Rodriguez", email: "ana@novatech.com", dept: "RRHH", credits: 20, spent: 0, avatar: "AR", status: "active" },
  { id: 4, name: "Carlos Ruiz", email: "carlos@novatech.com", dept: "Ventas", credits: 20, spent: 0, avatar: "CR", status: "active" },
  { id: 5, name: "Lucia Fernandez", email: "lucia@novatech.com", dept: "Finanzas", credits: 20, spent: 0, avatar: "LF", status: "active" },
];

const mockBenefits = [
  { id: 1, name: "Gym Pass — Megatlon", category: "Salud", credits: 15, provider: "Megatlon", status: "active", redemptions: 45, image: "🏋️" },
  { id: 2, name: "Coursera Plus", category: "Educacion", credits: 12, provider: "Coursera", status: "active", redemptions: 28, image: "📚" },
  { id: 3, name: "Starbucks Gift Card", category: "Gastronomia", credits: 5, provider: "Starbucks", status: "active", redemptions: 67, image: "☕" },
  { id: 4, name: "Netflix 1 Mes", category: "Entretenimiento", credits: 8, provider: "Netflix", status: "active", redemptions: 55, image: "🎬" },
  { id: 5, name: "Headspace Premium", category: "Bienestar", credits: 10, provider: "Headspace", status: "active", redemptions: 19, image: "🧘" },
  { id: 6, name: "PedidosYa Voucher", category: "Gastronomia", credits: 7, provider: "PedidosYa", status: "active", redemptions: 41, image: "🍕" },
];

const monthlyCredits = [
  { month: "Sep", cargados: 12000, canjeados: 8500 },
  { month: "Oct", cargados: 13500, canjeados: 9200 },
  { month: "Nov", cargados: 14000, canjeados: 10800 },
  { month: "Dic", cargados: 16000, canjeados: 13500 },
  { month: "Ene", cargados: 14500, canjeados: 11000 },
  { month: "Feb", cargados: 15000, canjeados: 12200 },
  { month: "Mar", cargados: 15800, canjeados: 11500 },
];

const categoryData = [
  { name: "Bienestar", value: 35, color: tokens.colors.humand[500] },
  { name: "Gastronomía", value: 25, color: tokens.colors.teal[500] },
  { name: "Educación", value: 18, color: tokens.colors.purple[500] },
  { name: "Entretenimiento", value: 12, color: tokens.colors.yellow[500] },
  { name: "Shopping", value: 10, color: tokens.colors.red[400] },
];

const deptUsage = [
  { dept: "Marketing", usage: 78 },
  { dept: "Tecnología", usage: 65 },
  { dept: "RRHH", usage: 82 },
  { dept: "Ventas", usage: 71 },
  { dept: "Finanzas", usage: 59 },
];

const recentActivity = [
  { user: "María García", action: "Canjeó Gimnasio mensual", credits: -500, time: "Hace 2 horas", type: "redemption" },
  { user: "Carlos López", action: "Recibió carga automática (cumpleaños)", credits: 1000, time: "Hace 5 horas", type: "credit" },
  { user: "Ana Martínez", action: "Canjeó Curso online", credits: -600, time: "Hace 1 día", type: "redemption" },
  { user: "Pedro Sánchez", action: "Carga masiva procesada", credits: 1500, time: "Hace 1 día", type: "credit" },
  { user: "Laura Fernández", action: "Canjeó Almuerzo gourmet", credits: -300, time: "Hace 2 días", type: "redemption" },
];

const autoRules = [
  { id: 1, name: "Carga mensual estándar", type: "periodic", trigger: "Mensual - día 1", amount: 1500, target: "Todos los colaboradores", status: "active", lastRun: "01/03/2026" },
  { id: 2, name: "Bonus de cumpleaños", type: "event", trigger: "Cumpleaños", amount: 1000, target: "Todos los colaboradores", status: "active", lastRun: "15/03/2026" },
  { id: 3, name: "Aniversario laboral", type: "event", trigger: "Aniversario", amount: 2000, target: "Todos los colaboradores", status: "active", lastRun: "10/03/2026" },
  { id: 4, name: "Bonus trimestral líderes", type: "periodic", trigger: "Trimestral - día 1", amount: 3000, target: "Grupo: Líderes", status: "paused", lastRun: "01/01/2026" },
  { id: 5, name: "Bienvenida nuevos ingresos", type: "event", trigger: "Alta de usuario", amount: 500, target: "Nuevos colaboradores", status: "active", lastRun: "12/03/2026" },
];

const ruleTypes = [
  { id: 1, name: "Carga periódica", icon: "repeat", rulesCount: 2, usersCount: 85, description: "Cargas recurrentes en intervalos regulares" },
  { id: 2, name: "Cumpleaños", icon: "cake", rulesCount: 1, usersCount: 85, description: "Créditos automáticos en el cumpleaños" },
  { id: 3, name: "Aniversario laboral", icon: "award", rulesCount: 1, usersCount: 85, description: "Bonus por años en la empresa" },
  { id: 4, name: "Onboarding", icon: "userplus", rulesCount: 1, usersCount: 12, description: "Bienvenida a nuevos colaboradores" },
];

const bulkHistory = [
  { id: 1, date: "15/03/2026", file: "carga_marzo_2026.csv", users: 85, credits: 1500, total: 127500, status: "completed", by: "Fermin C." },
  { id: 2, date: "01/03/2026", file: "bonus_Q1_lideres.csv", users: 12, credits: 3000, total: 36000, status: "completed", by: "Fermin C." },
  { id: 3, date: "15/02/2026", file: "carga_febrero_2026.csv", users: 82, credits: 1500, total: 123000, status: "completed", by: "Ana M." },
  { id: 4, date: "01/02/2026", file: "compensacion_especial.csv", users: 5, credits: 5000, total: 25000, status: "failed", by: "Fermin C." },
];

/* ════════════════════════════════════════════
   SHARED COMPONENTS
   ════════════════════════════════════════════ */
const baseStyles = {
  fontFamily: "'Roboto', sans-serif",
  letterSpacing: "0.2px",
  color: tokens.semantic.textDefault,
};

function Avatar({ initials, size = 36, color = tokens.colors.humand[400] }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: tokens.colors.humand[100],
      color: tokens.colors.humand[700],
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 600, letterSpacing: "0.2px",
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function Badge({ children, variant = "default" }) {
  const variants = {
    default: { bg: tokens.colors.humand[100], color: tokens.colors.humand[700] },
    success: { bg: tokens.colors.green[100], color: tokens.colors.green[700] },
    warning: { bg: tokens.colors.yellow[100], color: tokens.colors.yellow[700] },
    error: { bg: tokens.colors.red[100], color: tokens.colors.red[700] },
    info: { bg: tokens.colors.info[100], color: tokens.colors.info[700] },
    neutral: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[700] },
  };
  const v = variants[variant] || variants.default;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 10px",
      borderRadius: 999, fontSize: 12, fontWeight: 600,
      background: v.bg, color: v.color, letterSpacing: "0.2px", lineHeight: 1.4,
    }}>
      {children}
    </span>
  );
}

function Button({ children, variant = "primary", size = "md", icon: Icon, onClick, style: extraStyle }) {
  const sizes = {
    sm: { padding: "6px 12px", fontSize: 12 },
    md: { padding: "8px 16px", fontSize: 14 },
    lg: { padding: "12px 24px", fontSize: 16 },
  };
  const variants = {
    primary: { bg: tokens.colors.humand[500], color: "#fff", border: "none" },
    secondary: { bg: "#fff", color: tokens.colors.humand[500], border: `1px solid ${tokens.colors.humand[300]}` },
    ghost: { bg: "transparent", color: tokens.semantic.textLighter, border: "none" },
    danger: { bg: tokens.colors.red[500], color: "#fff", border: "none" },
  };
  const v = variants[variant];
  const s = sizes[size];
  return (
    <button onClick={onClick} style={{
      ...s, ...baseStyles, fontWeight: 600, borderRadius: tokens.radius.s,
      background: v.bg, color: v.color, border: v.border,
      cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
      transition: "all 0.15s ease", ...extraStyle,
    }}>
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

function Card({ children, style: extraStyle, noPadding }) {
  return (
    <div style={{
      background: tokens.semantic.bgCard,
      borderRadius: tokens.radius.l,
      boxShadow: tokens.shadow.dp4,
      padding: noPadding ? 0 : 24,
      ...extraStyle,
    }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, trendUp, color = tokens.colors.humand[500] }) {
  return (
    <Card style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: tokens.radius.m,
        background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={24} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: tokens.semantic.textLighter, lineHeight: 1.4, letterSpacing: "0.2px", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.4, letterSpacing: "0.2px" }}>{value}</div>
        {trend && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 12, color: trendUp ? tokens.colors.green[600] : tokens.colors.red[500], letterSpacing: "0.2px" }}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
      </div>
    </Card>
  );
}

function SearchInput({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
      <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: tokens.semantic.textDisabled }} />
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          ...baseStyles, width: "100%", padding: "8px 12px 8px 36px",
          border: `1px solid ${tokens.semantic.border}`, borderRadius: tokens.radius.m,
          fontSize: 14, lineHeight: 1.4, outline: "none", background: "#fff",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function Table({ columns, data }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", ...baseStyles, fontSize: 14, lineHeight: 1.4 }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{
                padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: 12,
                background: tokens.semantic.bgTableHeader, color: tokens.semantic.textTableHeader,
                borderBottom: `1px solid ${tokens.semantic.borderLight}`,
                letterSpacing: "0.2px", lineHeight: 1.4,
                ...(i === 0 ? { borderRadius: "8px 0 0 0" } : {}),
                ...(i === columns.length - 1 ? { borderRadius: "0 8px 0 0" } : {}),
              }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: `1px solid ${tokens.semantic.borderLight}` }}>
              {columns.map((col, ci) => (
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

function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${tokens.semantic.borderLight}`, marginBottom: 24 }}>
      {tabs.map(t => (
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

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: tokens.radius.l, padding: 32,
        width: wide ? 640 : 480, maxHeight: "85vh", overflowY: "auto",
        boxShadow: tokens.shadow.dp8,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ ...baseStyles, fontSize: 18, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: tokens.semantic.textLighter, padding: 4 }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ ...baseStyles, display: "block", fontSize: 12, fontWeight: 600, color: tokens.semantic.textLighter, marginBottom: 6, letterSpacing: "0.2px", lineHeight: 1.4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input {...props} style={{
      ...baseStyles, width: "100%", padding: "10px 12px",
      border: `1px solid ${tokens.semantic.border}`, borderRadius: tokens.radius.s,
      fontSize: 14, lineHeight: 1.4, outline: "none", boxSizing: "border-box",
      ...props.style,
    }} />
  );
}

function Select({ options, ...props }) {
  return (
    <select {...props} style={{
      ...baseStyles, width: "100%", padding: "10px 12px",
      border: `1px solid ${tokens.semantic.border}`, borderRadius: tokens.radius.s,
      fontSize: 14, lineHeight: 1.4, outline: "none", background: "#fff",
      boxSizing: "border-box", ...props.style,
    }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function EmptyDrop({ label }) {
  return (
    <div style={{
      border: `2px dashed ${tokens.semantic.border}`, borderRadius: tokens.radius.m,
      padding: 40, textAlign: "center", color: tokens.semantic.textLighter,
    }}>
      <Upload size={32} style={{ marginBottom: 12, color: tokens.colors.humand[400] }} />
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, letterSpacing: "0.2px" }}>{label}</div>
      <div style={{ fontSize: 12, letterSpacing: "0.2px" }}>Arrastrá un archivo o hacé click para seleccionar</div>
    </div>
  );
}

function ProgressBar({ value, max, color = tokens.colors.humand[500] }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ width: "100%", height: 6, background: tokens.colors.neutral[100], borderRadius: 3 }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.3s ease" }} />
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: DASHBOARD
   ════════════════════════════════════════════ */
function DashboardPage() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>Dashboard de Créditos</h1>
        <p style={{ ...baseStyles, fontSize: 14, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>
          Seguimiento general del uso de créditos en la plataforma
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard label="Créditos adquiridos" value="50,000" icon={DollarSign} trend="Disponibles para asignar" trendUp color={tokens.colors.purple[500]} />
        <StatCard label="Créditos totales asignados" value="127,500" icon={CreditCard} trend="+12% vs mes anterior" trendUp color={tokens.colors.humand[500]} />
        <StatCard label="Créditos canjeados" value="98,200" icon={Gift} trend="+8% vs mes anterior" trendUp color={tokens.colors.green[600]} />
        <StatCard label="Tasa de canje" value="77%" icon={TrendingUp} trend="+3pp vs mes anterior" trendUp color={tokens.colors.teal[500]} />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 32 }}>
        <Card>
          <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 20px 0", lineHeight: 1.4 }}>Créditos cargados vs canjeados</h3>
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
              <Area type="monotone" dataKey="cargados" stroke={tokens.colors.humand[500]} fill="url(#gradLoaded)" strokeWidth={2} name="Cargados" />
              <Area type="monotone" dataKey="canjeados" stroke={tokens.colors.green[500]} fill="url(#gradRedeemed)" strokeWidth={2} name="Canjeados" />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: "Roboto" }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 20px 0", lineHeight: 1.4 }}>Canjes por categoría</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RePieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, fontFamily: "Roboto" }} />
            </RePieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {categoryData.map((c, i) => (
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 20px 0", lineHeight: 1.4 }}>Uso por departamento</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {deptUsage.map((d, i) => (
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
          <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 20px 0", lineHeight: 1.4 }}>Actividad reciente</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {recentActivity.map((a, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
                borderBottom: i < recentActivity.length - 1 ? `1px solid ${tokens.semantic.borderLight}` : "none",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: a.type === "credit" ? tokens.colors.green[100] : tokens.colors.humand[100],
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {a.type === "credit" ? <ArrowUpRight size={16} color={tokens.colors.green[600]} /> : <Gift size={16} color={tokens.colors.humand[500]} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.2px", lineHeight: 1.4 }}>{a.user}</div>
                  <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px", lineHeight: 1.4 }}>{a.action}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: a.credits > 0 ? tokens.colors.green[600] : tokens.colors.red[500], letterSpacing: "0.2px" }}>
                    {a.credits > 0 ? "+" : ""}{a.credits.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </div>
                  <div style={{ fontSize: 11, color: tokens.semantic.textDisabled, letterSpacing: "0.2px" }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: BULK CREDIT LOADING
   ════════════════════════════════════════════ */
function BulkLoadPage() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>Carga masiva de créditos</h1>
          <p style={{ ...baseStyles, fontSize: 14, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>
            Cargá créditos a múltiples colaboradores mediante archivo CSV
          </p>
        </div>
        <Button icon={Upload} onClick={() => setShowModal(true)}>Nueva carga masiva</Button>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 24 }}>
          <div style={{ textAlign: "center", padding: 16, background: tokens.colors.humand[50], borderRadius: tokens.radius.m }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: tokens.colors.humand[700], letterSpacing: "0.2px" }}>4</div>
            <div style={{ fontSize: 12, color: tokens.semantic.textLighter, marginTop: 4, letterSpacing: "0.2px" }}>Cargas este mes</div>
          </div>
          <div style={{ textAlign: "center", padding: 16, background: tokens.colors.green[50], borderRadius: tokens.radius.m }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: tokens.colors.green[700], letterSpacing: "0.2px" }}>311,500</div>
            <div style={{ fontSize: 12, color: tokens.semantic.textLighter, marginTop: 4, letterSpacing: "0.2px" }}>Créditos cargados total</div>
          </div>
          <div style={{ textAlign: "center", padding: 16, background: tokens.colors.yellow[50], borderRadius: tokens.radius.m }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: tokens.colors.yellow[700], letterSpacing: "0.2px" }}>184</div>
            <div style={{ fontSize: 12, color: tokens.semantic.textLighter, marginTop: 4, letterSpacing: "0.2px" }}>Usuarios alcanzados</div>
          </div>
        </div>
      </Card>

      <Card noPadding>
        <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>Historial de cargas</h3>
          <Button variant="ghost" icon={Download} size="sm">Exportar</Button>
        </div>
        <div style={{ padding: "16px 24px 24px" }}>
          <Table
            columns={[
              { header: "Fecha", key: "date" },
              { header: "Archivo", key: "file", render: r => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileText size={14} color={tokens.colors.humand[400]} />
                  <span>{r.file}</span>
                </div>
              )},
              { header: "Usuarios", key: "users" },
              { header: "Créditos/usuario", key: "credits", render: r => r.credits.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") },
              { header: "Total", key: "total", render: r => <span style={{ fontWeight: 600 }}>{r.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span> },
              { header: "Estado", key: "status", render: r => (
                <Badge variant={r.status === "completed" ? "success" : "error"}>
                  {r.status === "completed" ? "Completado" : "Fallido"}
                </Badge>
              )},
              { header: "Creado por", key: "by" },
            ]}
            data={bulkHistory}
          />
        </div>
      </Card>

      {showModal && (
        <Modal title="Nueva carga masiva" onClose={() => setShowModal(false)} wide>
          <EmptyDrop label="Subí tu archivo CSV" />
          <div style={{ marginTop: 16, padding: 12, background: tokens.colors.info[50], borderRadius: tokens.radius.s, fontSize: 12, color: tokens.colors.info[700], letterSpacing: "0.2px", lineHeight: 1.4 }}>
            <strong>Formato esperado:</strong> El CSV debe contener las columnas: email, creditos. Podés descargar una plantilla de ejemplo.
          </div>
          <FormField label="Créditos por usuario (si no se especifica en el CSV)">
            <Input type="number" placeholder="1500" />
          </FormField>
          <FormField label="Motivo de la carga">
            <Input placeholder="Ej: Carga mensual marzo 2026" />
          </FormField>
          <FormField label="Fecha de expiración (opcional)">
            <Input type="date" />
          </FormField>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button icon={Upload}>Procesar carga</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: INDIVIDUAL CREDIT LOADING
   ════════════════════════════════════════════ */
function IndividualLoadPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const filtered = mockUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>Colaboradores</h1>
          <p style={{ ...baseStyles, fontSize: 14, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>
            Gestioná créditos de tus colaboradores de forma individual o masiva
          </p>
        </div>
        <Button icon={Upload} onClick={() => setShowBulkModal(true)}>Carga masiva</Button>
      </div>

      <Card noPadding>
        <div style={{ padding: "20px 24px", display: "flex", gap: 12, alignItems: "center" }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, email o departamento..." />
          <Button variant="secondary" icon={Filter} size="md">Filtros</Button>
        </div>
        <div style={{ padding: "0 24px 24px" }}>
          <Table
            columns={[
              { header: "Colaborador", key: "name", render: r => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar initials={r.avatar} size={32} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.2px" }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>{r.email}</div>
                  </div>
                </div>
              )},
              { header: "Departamento", key: "dept", render: r => <Badge variant="neutral">{r.dept}</Badge> },
              { header: "Créditos cargados", key: "credits", render: r => r.credits.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") },
              { header: "Créditos usados", key: "spent", render: r => r.spent.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") },
              { header: "Disponible", key: "available", render: r => {
                const avail = r.credits - r.spent;
                return <span style={{ fontWeight: 600, color: avail > 0 ? tokens.colors.green[600] : tokens.colors.red[500] }}>{avail.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>;
              }},
              { header: "Estado", key: "status", render: r => (
                <Badge variant={r.status === "active" ? "success" : "error"}>
                  {r.status === "active" ? "Activo" : "Inactivo"}
                </Badge>
              )},
              { header: "Acciones", key: "actions", render: r => (
                <Button variant="secondary" size="sm" icon={Plus} onClick={() => { setSelected(r); setShowModal(true); }}>
                  Cargar
                </Button>
              )},
            ]}
            data={filtered}
          />
        </div>
      </Card>

      {showModal && selected && (
        <Modal title={`Cargar créditos a ${selected.name}`} onClose={() => { setShowModal(false); setSelected(null); }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: tokens.colors.neutral[50], borderRadius: tokens.radius.m, marginBottom: 20 }}>
            <Avatar initials={selected.avatar} size={40} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "0.2px" }}>{selected.name}</div>
              <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>{selected.email} · {selected.dept}</div>
              <div style={{ fontSize: 12, color: tokens.colors.green[600], marginTop: 2, letterSpacing: "0.2px" }}>
                Disponible: {(selected.credits - selected.spent).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} créditos
              </div>
            </div>
          </div>
          <FormField label="Cantidad de créditos">
            <Input type="number" placeholder="Ej: 500" />
          </FormField>
          <FormField label="Motivo">
            <Select options={[
              { value: "", label: "Seleccionar motivo..." },
              { value: "bonus", label: "Bonus especial" },
              { value: "adjustment", label: "Ajuste" },
              { value: "compensation", label: "Compensación" },
              { value: "other", label: "Otro" },
            ]} />
          </FormField>
          <FormField label="Nota (opcional)">
            <Input placeholder="Comentario interno sobre la carga" />
          </FormField>
          <FormField label="Fecha de expiración (opcional)">
            <Input type="date" />
          </FormField>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <Button variant="secondary" onClick={() => { setShowModal(false); setSelected(null); }}>Cancelar</Button>
            <Button icon={CreditCard}>Cargar créditos</Button>
          </div>
        </Modal>
      )}

      {/* Bulk load modal */}
      {showBulkModal && (
        <Modal title="Carga masiva de créditos" onClose={() => setShowBulkModal(false)} wide>
          <EmptyDrop label="Subí tu archivo CSV" />
          <div style={{ marginTop: 16, padding: 12, background: tokens.colors.info[50], borderRadius: tokens.radius.s, fontSize: 12, color: tokens.colors.info[700], letterSpacing: "0.2px", lineHeight: 1.4 }}>
            <strong>Formato esperado:</strong> El CSV debe contener las columnas: email, creditos. Podés descargar una plantilla de ejemplo.
          </div>
          <FormField label="Créditos por usuario (si no se especifica en el CSV)">
            <Input type="number" placeholder="1500" />
          </FormField>
          <FormField label="Motivo de la carga">
            <Input placeholder="Ej: Carga mensual marzo 2026" />
          </FormField>
          <FormField label="Fecha de expiración (opcional)">
            <Input type="date" />
          </FormField>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <Button variant="secondary" onClick={() => setShowBulkModal(false)}>Cancelar</Button>
            <Button icon={Upload}>Procesar carga</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: AUTOMATIC RULES
   ════════════════════════════════════════════ */
function RuleTypeIcon({ type, size = 28 }) {
  const color = tokens.colors.humand[600];
  const icons = {
    repeat: <Repeat size={size} color={color} />,
    cake: <Gift size={size} color={color} />,
    award: <Award size={size} color={color} />,
    userplus: <UserPlus size={size} color={color} />,
  };
  return icons[type] || <Zap size={size} color={color} />;
}

function AutoRulesPage() {
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState("types");
  const [selectedType, setSelectedType] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  const rulesForType = selectedType
    ? autoRules.filter(r => {
        if (selectedType.id === 1) return r.type === "periodic";
        if (selectedType.id === 2) return r.trigger === "Cumpleaños";
        if (selectedType.id === 3) return r.trigger === "Aniversario";
        if (selectedType.id === 4) return r.trigger === "Alta de usuario";
        return false;
      })
    : [];

  return (
    <div>
      {/* Tabs row */}
      <Tabs
        tabs={[
          { key: "types", label: "Tipos de reglas" },
          { key: "rules", label: "Reglas" },
          { key: "history", label: "Historial" },
        ]}
        active={tab}
        onChange={t => { setTab(t); setSelectedType(null); }}
      />

      {/* ── TAB: Tipos de reglas ── */}
      {tab === "types" && !selectedType && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>Tipos de reglas</h1>
            <Button icon={Plus} onClick={() => setShowModal(true)}>Nuevo tipo de regla</Button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {ruleTypes.map(rt => (
              <div key={rt.id} onClick={() => setSelectedType(rt)} style={{
                background: "#fff", borderRadius: tokens.radius.l,
                border: `1px solid ${tokens.semantic.border}`,
                padding: "20px 20px 16px", cursor: "pointer",
                transition: "box-shadow 0.15s ease, border-color 0.15s ease",
                position: "relative",
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = tokens.shadow.dp4; e.currentTarget.style.borderColor = tokens.colors.humand[300]; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = tokens.semantic.border; }}
              >
                {/* Header: icon + menu */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: tokens.radius.m,
                    background: tokens.colors.humand[50],
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <RuleTypeIcon type={rt.icon} size={24} />
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === rt.id ? null : rt.id); }}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: tokens.semantic.textDisabled, padding: 4, borderRadius: tokens.radius.s,
                    }}
                  >
                    <MoreVertical size={18} />
                  </button>

                  {/* Dropdown menu */}
                  {menuOpen === rt.id && (
                    <div style={{
                      position: "absolute", top: 52, right: 16, background: "#fff",
                      borderRadius: tokens.radius.m, boxShadow: tokens.shadow.dp8,
                      border: `1px solid ${tokens.semantic.borderLight}`,
                      zIndex: 20, minWidth: 160, overflow: "hidden",
                    }}>
                      {[
                        { label: "Editar", icon: Edit3 },
                        { label: "Duplicar", icon: Layers },
                        { label: "Pausar todas", icon: X },
                        { label: "Eliminar", icon: Trash2, danger: true },
                      ].map((action, i) => (
                        <button key={i} onClick={e => { e.stopPropagation(); setMenuOpen(null); }} style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 14px", background: "none", border: "none",
                          cursor: "pointer", fontSize: 13, fontFamily: "Roboto",
                          color: action.danger ? tokens.colors.red[600] : tokens.semantic.textDefault,
                          letterSpacing: "0.2px",
                          borderBottom: i < 3 ? `1px solid ${tokens.semantic.borderLight}` : "none",
                        }}>
                          <action.icon size={15} />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title */}
                <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "0.2px", lineHeight: 1.4, marginBottom: 6, color: tokens.semantic.textDefault }}>
                  {rt.name}
                </div>

                {/* Subtitle */}
                <div style={{ fontSize: 13, color: tokens.semantic.textLighter, letterSpacing: "0.2px", lineHeight: 1.4 }}>
                  {rt.rulesCount} {rt.rulesCount === 1 ? "regla" : "reglas"}, {rt.usersCount} personas
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Tipos de reglas → Detalle de un tipo ── */}
      {tab === "types" && selectedType && (
        <div>
          <button onClick={() => setSelectedType(null)} style={{
            ...baseStyles, display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: tokens.colors.humand[500], fontSize: 13, fontWeight: 600,
            padding: 0, marginBottom: 20, letterSpacing: "0.2px",
          }}>
            <ChevronLeft size={16} /> Volver a tipos de reglas
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: tokens.radius.m,
                background: tokens.colors.humand[50],
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <RuleTypeIcon type={selectedType.icon} size={26} />
              </div>
              <div>
                <h1 style={{ ...baseStyles, fontSize: 22, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{selectedType.name}</h1>
                <p style={{ ...baseStyles, fontSize: 13, color: tokens.semantic.textLighter, marginTop: 2, lineHeight: 1.4 }}>
                  {selectedType.description}
                </p>
              </div>
            </div>
            <Button icon={Plus} onClick={() => setShowModal(true)}>Nueva regla</Button>
          </div>

          <Card noPadding>
            <div style={{ padding: "16px 24px" }}>
              {rulesForType.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: tokens.semantic.textLighter }}>
                  <Zap size={32} style={{ marginBottom: 8, color: tokens.semantic.textDisabled }} />
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, letterSpacing: "0.2px" }}>No hay reglas configuradas</div>
                  <div style={{ fontSize: 13, letterSpacing: "0.2px" }}>Creá una nueva regla para este tipo</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {rulesForType.map(rule => (
                    <div key={rule.id} style={{
                      display: "flex", alignItems: "center", gap: 16, padding: 16,
                      border: `1px solid ${tokens.semantic.borderLight}`, borderRadius: tokens.radius.m,
                      background: rule.status === "paused" ? tokens.colors.neutral[50] : "#fff",
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: "0.2px" }}>{rule.name}</span>
                          <Badge variant={rule.status === "active" ? "success" : "warning"}>
                            {rule.status === "active" ? "Activa" : "Pausada"}
                          </Badge>
                        </div>
                        <div style={{ fontSize: 12, color: tokens.semantic.textLighter, marginTop: 4, letterSpacing: "0.2px", lineHeight: 1.4 }}>
                          Trigger: {rule.trigger} · {rule.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} créditos · {rule.target}
                        </div>
                        <div style={{ fontSize: 11, color: tokens.semantic.textDisabled, marginTop: 2, letterSpacing: "0.2px" }}>
                          Última ejecución: {rule.lastRun}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button variant="ghost" size="sm" icon={Edit3}>Editar</Button>
                        <Button variant="ghost" size="sm" icon={rule.status === "active" ? X : Check}>
                          {rule.status === "active" ? "Pausar" : "Activar"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB: Reglas (flat list) ── */}
      {tab === "rules" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>Reglas</h1>
            <Button icon={Plus} onClick={() => setShowModal(true)}>Nueva regla</Button>
          </div>
          <Card noPadding>
            <div style={{ padding: "16px 24px" }}>
              <Table
                columns={[
                  { header: "Regla", key: "name", render: r => (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: tokens.radius.m, flexShrink: 0,
                        background: r.type === "periodic" ? tokens.colors.humand[50] : tokens.colors.purple[50],
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {r.type === "periodic" ? <Repeat size={18} color={tokens.colors.humand[600]} /> : <Sparkles size={18} color={tokens.colors.purple[600]} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.2px" }}>{r.name}</div>
                        <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>{r.target}</div>
                      </div>
                    </div>
                  )},
                  { header: "Trigger", key: "trigger" },
                  { header: "Créditos", key: "amount", render: r => <span style={{ fontWeight: 600 }}>{r.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span> },
                  { header: "Última ejecución", key: "lastRun" },
                  { header: "Estado", key: "status", render: r => (
                    <Badge variant={r.status === "active" ? "success" : "warning"}>
                      {r.status === "active" ? "Activa" : "Pausada"}
                    </Badge>
                  )},
                  { header: "", key: "actions", render: r => (
                    <div style={{ display: "flex", gap: 4 }}>
                      <Button variant="ghost" size="sm" icon={Edit3} />
                      <Button variant="ghost" size="sm" icon={Trash2} />
                    </div>
                  )},
                ]}
                data={autoRules}
              />
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB: Historial ── */}
      {tab === "history" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>Historial de ejecuciones</h1>
            <Button variant="secondary" icon={Download} size="md">Exportar</Button>
          </div>
          <Card noPadding>
            <div style={{ padding: "16px 24px" }}>
              <Table
                columns={[
                  { header: "Fecha", key: "date", render: () => {
                    const dates = ["18/03/2026", "15/03/2026", "10/03/2026", "01/03/2026", "15/02/2026", "01/02/2026"];
                    return dates[Math.floor(Math.random() * dates.length)];
                  }},
                  { header: "Regla", key: "name" },
                  { header: "Trigger", key: "trigger" },
                  { header: "Usuarios", key: "target", render: r => {
                    const counts = [85, 12, 1, 85, 3];
                    return counts[Math.floor(Math.random() * counts.length)];
                  }},
                  { header: "Créditos total", key: "amount", render: r => <span style={{ fontWeight: 600 }}>{(r.amount * 85).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span> },
                  { header: "Estado", key: "status", render: () => (
                    <Badge variant="success">Ejecutada</Badge>
                  )},
                ]}
                data={autoRules.filter(r => r.status === "active")}
              />
            </div>
          </Card>
        </div>
      )}

      {/* ── Modal: Nueva regla ── */}
      {showModal && (
        <Modal title="Nueva regla automática" onClose={() => setShowModal(false)} wide>
          <FormField label="Nombre de la regla">
            <Input placeholder="Ej: Bonus de cumpleaños" />
          </FormField>
          <FormField label="Tipo de trigger">
            <Select options={[
              { value: "", label: "Seleccionar tipo..." },
              { value: "periodic", label: "Periódico (diario, semanal, mensual, etc.)" },
              { value: "birthday", label: "Evento: Cumpleaños" },
              { value: "anniversary", label: "Evento: Aniversario laboral" },
              { value: "onboarding", label: "Evento: Alta de usuario" },
              { value: "custom", label: "Evento personalizado" },
            ]} />
          </FormField>
          <FormField label="Periodicidad (si aplica)">
            <Select options={[
              { value: "", label: "Seleccionar..." },
              { value: "daily", label: "Diario" },
              { value: "weekly", label: "Semanal" },
              { value: "monthly", label: "Mensual" },
              { value: "quarterly", label: "Trimestral" },
              { value: "yearly", label: "Anual" },
            ]} />
          </FormField>
          <FormField label="Cantidad de créditos">
            <Input type="number" placeholder="Ej: 1000" />
          </FormField>
          <FormField label="Aplicar a">
            <Select options={[
              { value: "all", label: "Todos los colaboradores" },
              { value: "group", label: "Grupo específico" },
              { value: "dept", label: "Departamento" },
              { value: "segment", label: "Segmento" },
            ]} />
          </FormField>
          <FormField label="Fecha de expiración de créditos (opcional)">
            <Input type="date" />
          </FormField>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button icon={Zap}>Crear regla</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: BENEFITS MANAGEMENT
   ════════════════════════════════════════════ */
function BenefitsPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  const filtered = mockBenefits.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>Gestión de Beneficios</h1>
          <p style={{ ...baseStyles, fontSize: 14, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>
            Administrá el catálogo de beneficios disponibles para canjear
          </p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>Nuevo beneficio</Button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar beneficios..." />
        <Button variant={viewMode === "grid" ? "primary" : "secondary"} size="sm" icon={Layers} onClick={() => setViewMode("grid")} />
        <Button variant={viewMode === "list" ? "primary" : "secondary"} size="sm" icon={FileText} onClick={() => setViewMode("list")} />
      </div>

      {viewMode === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {filtered.map(b => (
            <Card key={b.id} style={{ cursor: "pointer", transition: "box-shadow 0.15s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ fontSize: 40, lineHeight: 1 }}>{b.image}</div>
                <Badge variant={b.status === "active" ? "success" : "warning"}>
                  {b.status === "active" ? "Activo" : "Pausado"}
                </Badge>
              </div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, letterSpacing: "0.2px", lineHeight: 1.4 }}>{b.name}</div>
              <div style={{ fontSize: 12, color: tokens.semantic.textLighter, marginBottom: 12, letterSpacing: "0.2px" }}>{b.category} · {b.provider}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <CreditCard size={14} color={tokens.colors.humand[500]} />
                  <span style={{ fontWeight: 600, fontSize: 14, color: tokens.colors.humand[600], letterSpacing: "0.2px" }}>{b.credits}</span>
                  <span style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>créditos</span>
                </div>
                <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>
                  {b.redemptions} canjes
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <Button variant="secondary" size="sm" icon={Edit3} style={{ flex: 1 }}>Editar</Button>
                <Button variant="ghost" size="sm" icon={Eye}>Ver</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card noPadding>
          <div style={{ padding: "16px 24px" }}>
            <Table
              columns={[
                { header: "Beneficio", key: "name", render: r => (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{r.image}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.2px" }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>{r.provider}</div>
                    </div>
                  </div>
                )},
                { header: "Categoría", key: "category", render: r => <Badge>{r.category}</Badge> },
                { header: "Créditos", key: "credits", render: r => <span style={{ fontWeight: 600 }}>{r.credits}</span> },
                { header: "Canjes", key: "redemptions" },
                { header: "Estado", key: "status", render: r => (
                  <Badge variant={r.status === "active" ? "success" : "warning"}>
                    {r.status === "active" ? "Activo" : "Pausado"}
                  </Badge>
                )},
                { header: "Acciones", key: "actions", render: () => (
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
        <Modal title="Nuevo beneficio" onClose={() => setShowModal(false)} wide>
          <FormField label="Nombre del beneficio">
            <Input placeholder="Ej: Gimnasio mensual" />
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormField label="Categoría">
              <Select options={[
                { value: "", label: "Seleccionar..." },
                { value: "wellness", label: "Bienestar" },
                { value: "education", label: "Educación" },
                { value: "food", label: "Gastronomía" },
                { value: "entertainment", label: "Entretenimiento" },
                { value: "shopping", label: "Shopping" },
                { value: "mobility", label: "Movilidad" },
                { value: "timeoff", label: "Tiempo libre" },
              ]} />
            </FormField>
            <FormField label="Proveedor">
              <Input placeholder="Ej: SmartFit" />
            </FormField>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormField label="Costo en créditos">
              <Input type="number" placeholder="Ej: 500" />
            </FormField>
            <FormField label="Stock disponible (opcional)">
              <Input type="number" placeholder="Ilimitado si se deja vacío" />
            </FormField>
          </div>
          <FormField label="Descripción">
            <textarea placeholder="Describí el beneficio..." style={{
              ...baseStyles, width: "100%", padding: "10px 12px", minHeight: 80,
              border: `1px solid ${tokens.semantic.border}`, borderRadius: tokens.radius.s,
              fontSize: 14, lineHeight: 1.4, outline: "none", resize: "vertical",
              boxSizing: "border-box",
            }} />
          </FormField>
          <FormField label="Imagen o emoji representativo">
            <Input placeholder="Ej: 🏋️ o URL de imagen" />
          </FormField>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button icon={Plus}>Crear beneficio</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: ANALYTICS
   ════════════════════════════════════════════ */
function AnalyticsPage() {
  const [period, setPeriod] = useState("month");

  const topBenefits = [...mockBenefits].sort((a, b) => b.redemptions - a.redemptions).slice(0, 5);
  const topUsers = [...mockUsers].sort((a, b) => b.spent - a.spent).slice(0, 5);

  const weeklyTrend = [
    { week: "Sem 1", canjes: 45 }, { week: "Sem 2", canjes: 62 },
    { week: "Sem 3", canjes: 58 }, { week: "Sem 4", canjes: 71 },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ ...baseStyles, fontSize: 24, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>Analíticas de uso</h1>
          <p style={{ ...baseStyles, fontSize: 14, color: tokens.semantic.textLighter, marginTop: 4, lineHeight: 1.4 }}>
            Insights sobre el uso de créditos y beneficios por parte de los colaboradores
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["week", "month", "quarter", "year"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              ...baseStyles, padding: "6px 14px", fontSize: 12, fontWeight: period === p ? 600 : 400,
              background: period === p ? tokens.colors.humand[500] : "#fff",
              color: period === p ? "#fff" : tokens.semantic.textLighter,
              border: `1px solid ${period === p ? tokens.colors.humand[500] : tokens.semantic.border}`,
              borderRadius: tokens.radius.s, cursor: "pointer",
            }}>
              {{ week: "Semana", month: "Mes", quarter: "Trimestre", year: "Año" }[p]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard label="Usuarios activos" value="63" icon={Users} trend="+5 vs mes anterior" trendUp color={tokens.colors.humand[500]} />
        <StatCard label="Canjes totales" value="325" icon={Gift} trend="+18% vs mes anterior" trendUp color={tokens.colors.green[600]} />
        <StatCard label="Promedio canjes/usuario" value="5.2" icon={BarChart3} trend="+0.3 vs mes anterior" trendUp color={tokens.colors.purple[500]} />
        <StatCard label="Satisfacción" value="4.7/5" icon={Star} trend="+0.2 vs mes anterior" trendUp color={tokens.colors.yellow[500]} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Card>
          <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 20px 0", lineHeight: 1.4 }}>Tendencia de canjes semanal</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={tokens.semantic.borderLight} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: tokens.semantic.textLighter }} />
              <YAxis tick={{ fontSize: 12, fill: tokens.semantic.textLighter }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, fontFamily: "Roboto" }} />
              <Bar dataKey="canjes" fill={tokens.colors.humand[400]} radius={[4, 4, 0, 0]} name="Canjes" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 20px 0", lineHeight: 1.4 }}>Uso por departamento</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={deptUsage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={tokens.semantic.borderLight} />
              <XAxis type="number" tick={{ fontSize: 12, fill: tokens.semantic.textLighter }} domain={[0, 100]} />
              <YAxis type="category" dataKey="dept" tick={{ fontSize: 12, fill: tokens.semantic.textLighter }} width={80} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, fontFamily: "Roboto" }} formatter={v => `${v}%`} />
              <Bar dataKey="usage" radius={[0, 4, 4, 0]} name="Uso %">
                {deptUsage.map((d, i) => (
                  <Cell key={i} fill={d.usage > 75 ? tokens.colors.green[500] : d.usage > 50 ? tokens.colors.humand[400] : tokens.colors.yellow[500]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 20px 0", lineHeight: 1.4 }}>Top beneficios más canjeados</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topBenefits.map((b, i) => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < topBenefits.length - 1 ? `1px solid ${tokens.semantic.borderLight}` : "none" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: tokens.semantic.textDisabled, width: 20, letterSpacing: "0.2px" }}>#{i + 1}</span>
                <span style={{ fontSize: 20 }}>{b.image}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.2px" }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>{b.category}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "0.2px" }}>{b.redemptions}</div>
                  <div style={{ fontSize: 11, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>canjes</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 style={{ ...baseStyles, fontSize: 16, fontWeight: 600, margin: "0 0 20px 0", lineHeight: 1.4 }}>Colaboradores con mayor uso</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topUsers.map((u, i) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < topUsers.length - 1 ? `1px solid ${tokens.semantic.borderLight}` : "none" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: tokens.semantic.textDisabled, width: 20, letterSpacing: "0.2px" }}>#{i + 1}</span>
                <Avatar initials={u.avatar} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.2px" }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>{u.dept}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "0.2px" }}>{u.spent.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                  <div style={{ fontSize: 11, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>créditos usados</div>
                </div>
                <ProgressBar value={u.spent} max={u.credits} color={tokens.colors.humand[400]} />
              </div>
            ))}
          </div>
        </Card>
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
  { key: "auto", label: "Cargas automáticas" },
  { key: "analytics", label: "Analíticas" },
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
  // Data is consistent with Supabase (same users, same benefits, same amounts)

  const isBenefitsPage = benefitsSubNav.some(s => s.key === activePage);

  const renderPage = () => {
    // forces re-render when Supabase data arrives
    switch (activePage) {
      case "dashboard": return <DashboardPage />;
      case "bulk": return <BulkLoadPage />;
      case "individual": return <IndividualLoadPage />;
      case "auto": return <AutoRulesPage />;
      case "benefits": return <BenefitsPage />;
      case "analytics": return <AnalyticsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: tokens.semantic.bgPage, ...baseStyles }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarCollapsed ? 72 : 260, background: "#fff", borderRight: `1px solid ${tokens.semantic.borderLight}`,
        display: "flex", flexDirection: "column", transition: "width 0.2s ease", flexShrink: 0,
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{
          padding: sidebarCollapsed ? "20px 16px" : "20px 24px",
          display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${tokens.semantic.borderLight}`,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: tokens.radius.m,
            background: tokens.colors.humand[500], display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 600, fontSize: 14, flexShrink: 0, letterSpacing: "0.2px",
          }}>
            hu
          </div>
          {!sidebarCollapsed && (
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: "0.2px", lineHeight: 1.4 }}>Perks</div>
              <Badge variant="default">Admin</Badge>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          {/* Other nav items above the benefits group */}
          {otherNav.slice(0, 6).map(item => {
            const Icon = item.icon;
            return (
              <button key={item.key} onClick={() => {}} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: sidebarCollapsed ? "10px 0" : "10px 12px",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                background: "transparent", color: tokens.semantic.textLighter,
                border: "none", borderRadius: tokens.radius.s, cursor: "pointer",
                fontSize: 14, fontWeight: 400, marginBottom: 2,
                fontFamily: "Roboto", letterSpacing: "0.2px",
                transition: "all 0.15s ease",
              }}>
                <Icon size={20} />
                {!sidebarCollapsed && item.label}
              </button>
            );
          })}

          {/* ── Beneficios collapsible group ── */}
          <div style={{
            margin: "4px 0",
            background: benefitsOpen ? tokens.colors.neutral[50] : "transparent",
            borderRadius: tokens.radius.m,
            transition: "background 0.2s ease",
          }}>
            {/* Group header */}
            <button onClick={() => { setBenefitsOpen(!benefitsOpen); if (!benefitsOpen && !isBenefitsPage) setActivePage("dashboard"); }} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: sidebarCollapsed ? "10px 0" : "10px 12px",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              background: "transparent",
              color: isBenefitsPage ? tokens.colors.humand[600] : tokens.semantic.textLighter,
              border: "none", borderRadius: tokens.radius.s, cursor: "pointer",
              fontSize: 14, fontWeight: isBenefitsPage ? 600 : 400,
              fontFamily: "Roboto", letterSpacing: "0.2px",
              transition: "all 0.15s ease",
            }}>
              <Gift size={20} />
              {!sidebarCollapsed && (
                <>
                  <span style={{ flex: 1, textAlign: "left" }}>Beneficios</span>
                  <ChevronDown size={16} style={{
                    transition: "transform 0.2s ease",
                    transform: benefitsOpen ? "rotate(0deg)" : "rotate(-90deg)",
                  }} />
                </>
              )}
            </button>

            {/* Sub-items */}
            {benefitsOpen && !sidebarCollapsed && (
              <div style={{ padding: "0 0 8px 0" }}>
                {benefitsSubNav.map(sub => {
                  const isActive = activePage === sub.key;
                  return (
                    <button key={sub.key} onClick={() => setActivePage(sub.key)} style={{
                      width: "100%", display: "flex", alignItems: "center",
                      padding: "8px 12px 8px 44px", textAlign: "left",
                      background: "transparent",
                      color: isActive ? tokens.colors.humand[600] : tokens.semantic.textLighter,
                      border: "none", cursor: "pointer",
                      fontSize: 14, fontWeight: isActive ? 600 : 400,
                      fontFamily: "Roboto", letterSpacing: "0.2px",
                      borderRadius: tokens.radius.s,
                      transition: "all 0.15s ease",
                    }}>
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Remaining nav items */}
          {otherNav.slice(6).map(item => {
            const Icon = item.icon;
            return (
              <button key={item.key} onClick={() => {}} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: sidebarCollapsed ? "10px 0" : "10px 12px",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                background: "transparent", color: tokens.semantic.textLighter,
                border: "none", borderRadius: tokens.radius.s, cursor: "pointer",
                fontSize: 14, fontWeight: 400, marginBottom: 2,
                fontFamily: "Roboto", letterSpacing: "0.2px",
                transition: "all 0.15s ease",
              }}>
                <Icon size={20} />
                {!sidebarCollapsed && item.label}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
          padding: 16, background: "none", border: "none", borderTop: `1px solid ${tokens.semantic.borderLight}`,
          cursor: "pointer", color: tokens.semantic.textLighter, display: "flex",
          alignItems: "center", justifyContent: "center", gap: 8, fontSize: 12, fontFamily: "Roboto", letterSpacing: "0.2px",
        }}>
          {sidebarCollapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> Colapsar</>}
        </button>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: tokens.semantic.bgPage }}>
        {/* Top bar */}
        <header style={{
          height: 56, background: "#fff", borderBottom: `1px solid ${tokens.semantic.borderLight}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", position: "sticky", top: 0, zIndex: 10, flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, color: tokens.semantic.textLighter, letterSpacing: "0.2px" }}>
              Plataforma de Beneficios Corporativos
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: tokens.semantic.textLighter, padding: 4 }}>
              <HelpCircle size={20} />
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: tokens.semantic.textLighter, padding: 4 }}>
              <Bell size={20} />
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: tokens.semantic.textLighter, padding: 4 }}>
              <Globe size={20} />
            </button>
            <Avatar initials="FC" size={32} />
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: 32, minHeight: "calc(100vh - 56px)" }}>
          <div style={{ maxWidth: 1200 }}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
