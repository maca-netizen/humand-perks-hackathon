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
  Layers, LayoutDashboard, Package, PieChart, UserCheck, Sparkles, PartyPopper
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

  // Derived data for dashboard
  const credits = transactions.filter(t => t.type === "credit");
  const debits = transactions.filter(t => t.type === "debit");
  const totalCredited = credits.reduce((s, t) => s + Number(t.amount), 0);
  const totalRedeemed = debits.reduce((s, t) => s + Number(t.amount), 0);
  const totalPending = Math.round((totalCredited - totalRedeemed) * 100) / 100;
  const employees = users.filter(u => u.role === "employee");

  // Users with wallet data merged
  const usersWithWallet = users.map(u => {
    const w = wallets.find(w => w.user_id === u.id);
    const userCredits = credits.filter(t => t.wallet_id === w?.id).reduce((s, t) => s + Number(t.amount), 0);
    const userSpent = debits.filter(t => t.wallet_id === w?.id).reduce((s, t) => s + Number(t.amount), 0);
    return {
      ...u,
      avatar: getInitials(u.name),
      credits: userCredits,
      spent: userSpent,
      balance: w?.balance || 0,
    };
  });

  // Benefits with redemption counts
  const benefitsWithStats = benefits.map(b => {
    const redemptionCount = debits.filter(t => t.benefit_id === b.id).length;
    return {
      ...b,
      credits: Number(b.cost),
      provider: b.merchant || "",
      status: b.active ? "active" : "paused",
      redemptions: redemptionCount,
      image: categoryEmojis[b.category?.toLowerCase()] || "🎁",
    };
  });

  // Category breakdown for pie chart
  const catCounts: Record<string, number> = {};
  debits.forEach(t => {
    const benefit = benefits.find(b => b.id === t.benefit_id);
    if (benefit) {
      const cat = benefit.category || "Otro";
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    }
  });
  const totalDebits = debits.length || 1;
  const categoryData = Object.entries(catCounts).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round((count / totalDebits) * 100),
    color: categoryColors[name.toLowerCase()] || tokens.colors.neutral[400],
  }));

  // Department usage
  const deptMap: Record<string, { total: number; spent: number }> = {};
  usersWithWallet.forEach(u => {
    if (!u.dept) return;
    if (!deptMap[u.dept]) deptMap[u.dept] = { total: 0, spent: 0 };
    deptMap[u.dept].total += u.credits || 1;
    deptMap[u.dept].spent += u.spent;
  });
  const deptUsage = Object.entries(deptMap).map(([dept, v]) => ({
    dept,
    usage: v.total > 0 ? Math.round((v.spent / v.total) * 100) : 0,
  }));

  // Recent activity from transactions
  const recentActivity = transactions.slice(0, 5).map(t => {
    const user = users.find(u => {
      const w = wallets.find(w => w.user_id === u.id);
      return w?.id === t.wallet_id;
    });
    return {
      user: user?.name || "Usuario",
      action: t.description,
      credits: t.type === "credit" ? Number(t.amount) : -Number(t.amount),
      time: timeAgo(t.created_at),
      type: t.type === "credit" ? "credit" : "redemption",
    };
  });

  // Monthly credits chart data (aggregate by month)
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthMap: Record<string, { cargados: number; canjeados: number }> = {};
  transactions.forEach(t => {
    const d = new Date(t.created_at);
    const key = monthNames[d.getMonth()];
    if (!monthMap[key]) monthMap[key] = { cargados: 0, canjeados: 0 };
    if (t.type === "credit") monthMap[key].cargados += Number(t.amount);
    else monthMap[key].canjeados += Number(t.amount);
  });
  const monthlyCredits = Object.entries(monthMap).map(([month, v]) => ({ month, ...v }));
  if (monthlyCredits.length === 0) monthlyCredits.push({ month: "Mar", cargados: 0, canjeados: 0 });

  // Auto rules formatted
  const autoRules = autoRulesData.map(r => ({
    ...r,
    amount: Number(r.amount),
    lastRun: r.last_run ? new Date(r.last_run).toLocaleDateString("es-AR") : "—",
  }));

  // Rule types (derived from auto_rules)
  const ruleTypes = [
    { id: 1, name: "Carga periódica", icon: "repeat", rulesCount: autoRules.filter(r => r.type === "periodic").length, usersCount: employees.length, description: "Cargas recurrentes en intervalos regulares" },
    { id: 2, name: "Cumpleaños", icon: "cake", rulesCount: autoRules.filter(r => r.trigger === "Cumpleaños").length, usersCount: employees.length, description: "Créditos automáticos en el cumpleaños" },
    { id: 3, name: "Aniversario laboral", icon: "award", rulesCount: autoRules.filter(r => r.trigger === "Aniversario").length, usersCount: employees.length, description: "Bonus por años en la empresa" },
    { id: 4, name: "Onboarding", icon: "userplus", rulesCount: autoRules.filter(r => r.trigger === "Alta de usuario").length, usersCount: employees.length, description: "Bienvenida a nuevos colaboradores" },
  ];

  // Bulk history formatted
  const bulkHistory = bulkHistoryData.map(b => ({
    ...b,
    date: new Date(b.date).toLocaleDateString("es-AR"),
    users: b.users_count,
    credits: Number(b.credits),
    total: Number(b.total),
    by: b.created_by || "—",
  }));

  return {
    loading, refresh, users: usersWithWallet, benefits: benefitsWithStats,
    transactions, totalCredited, totalRedeemed, totalPending,
    employees, categoryData, deptUsage, recentActivity,
    monthlyCredits, autoRules, ruleTypes, bulkHistory, wallets,
  };
}

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
  const [hovered, setHovered] = useState(false);
  const sizes = {
    sm: { padding: "6px 12px", fontSize: 12 },
    md: { padding: "8px 16px", fontSize: 14 },
    lg: { padding: "12px 24px", fontSize: 16 },
  };
  const variants = {
    primary: { bg: `linear-gradient(135deg, ${tokens.colors.humand[500]}, ${tokens.colors.humand[600]})`, color: "#fff", border: "none" },
    secondary: { bg: "#fff", color: tokens.colors.humand[500], border: `1px solid ${tokens.colors.humand[300]}` },
    ghost: { bg: "transparent", color: tokens.semantic.textLighter, border: "none" },
    danger: { bg: `linear-gradient(135deg, ${tokens.colors.red[500]}, ${tokens.colors.red[600]})`, color: "#fff", border: "none" },
  };
  const v = variants[variant];
  const s = sizes[size];
  const hoverStyle = hovered ? (
    variant === "primary" || variant === "danger"
      ? { transform: "translateY(-1px)", boxShadow: tokens.shadow.glow }
      : variant === "secondary"
        ? { boxShadow: tokens.shadow.dp2, borderColor: tokens.colors.humand[400] }
        : { background: tokens.colors.neutral[100] }
  ) : {};
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        ...s, ...baseStyles, fontWeight: 600, borderRadius: tokens.radius.m,
        background: v.bg, color: v.color, border: v.border,
        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
        transition: tokens.transition.fast, ...hoverStyle, ...extraStyle,
      }}>
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

function Card({ children, style: extraStyle, noPadding, hoverable }: any) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={hoverable ? () => setHovered(true) : undefined}
      onMouseLeave={hoverable ? () => setHovered(false) : undefined}
      style={{
        background: tokens.semantic.bgCard,
        borderRadius: tokens.radius.l,
        boxShadow: hovered ? tokens.shadow.dp8 : tokens.shadow.dp4,
        borderTop: `1px solid ${hovered ? tokens.colors.humand[200] : "transparent"}`,
        borderRight: `1px solid ${hovered ? tokens.colors.humand[200] : "transparent"}`,
        borderBottom: `1px solid ${hovered ? tokens.colors.humand[200] : "transparent"}`,
        borderLeft: `1px solid ${hovered ? tokens.colors.humand[200] : "transparent"}`,
        padding: noPadding ? 0 : 24,
        transition: tokens.transition.medium,
        ...extraStyle,
      }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, trendUp, color = tokens.colors.humand[500] }) {
  return (
    <Card hoverable style={{ display: "flex", alignItems: "flex-start", gap: 16, borderLeft: `3px solid ${color}` }}>
      <div style={{
        width: 52, height: 52, borderRadius: tokens.radius.m,
        background: `radial-gradient(circle at top left, ${color}20, ${color}08)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
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
  const [hoveredRow, setHoveredRow] = useState(-1);
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", ...baseStyles, fontSize: 14, lineHeight: 1.4 }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{
                padding: "12px 16px", textAlign: "left", fontWeight: 700, fontSize: 11,
                textTransform: "uppercase" as const, letterSpacing: "0.5px",
                background: tokens.semantic.bgTableHeader, color: tokens.semantic.textTableHeader,
                borderBottom: `1px solid ${tokens.semantic.borderLight}`,
                lineHeight: 1.4,
                ...(i === 0 ? { borderRadius: "8px 0 0 0" } : {}),
                ...(i === columns.length - 1 ? { borderRadius: "0 8px 0 0" } : {}),
              }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: 40, textAlign: "center", color: tokens.semantic.textDisabled, fontSize: 13 }}>No hay datos disponibles</td></tr>
          ) : data.map((row, ri) => (
            <tr key={ri}
              onMouseEnter={() => setHoveredRow(ri)} onMouseLeave={() => setHoveredRow(-1)}
              style={{
                borderBottom: `1px solid ${tokens.semantic.borderLight}`,
                background: hoveredRow === ri ? tokens.colors.neutral[50] : "transparent",
                transition: tokens.transition.fast,
              }}>
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
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      animation: "fadeIn 0.2s ease-out",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 20, padding: 32,
        width: wide ? 640 : 480, maxHeight: "85vh", overflowY: "auto",
        boxShadow: tokens.shadow.dp12,
        animation: "fadeInUp 0.25s ease-out",
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
function DashboardPage({ data }: { data: any }) {
  const { totalCredited, totalRedeemed, totalPending, employees, categoryData, deptUsage, recentActivity, monthlyCredits } = data;
  const rate = totalCredited > 0 ? Math.round((totalRedeemed / totalCredited) * 100) : 0;
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
        <StatCard label="Créditos pendientes" value={fmtCurrency(totalPending)} icon={DollarSign} trend="Disponibles para canjear" trendUp color={tokens.colors.purple[500]} />
        <StatCard label="Créditos totales asignados" value={fmtCurrency(totalCredited)} icon={CreditCard} trend={`${employees.length} colaboradores`} trendUp color={tokens.colors.humand[500]} />
        <StatCard label="Créditos canjeados" value={fmtCurrency(totalRedeemed)} icon={Gift} trend={`${data.transactions.filter((t:any) => t.type === 'debit').length} canjes`} trendUp color={tokens.colors.green[600]} />
        <StatCard label="Tasa de canje" value={`${rate}%`} icon={TrendingUp} trend="del total asignado" trendUp={rate > 50} color={tokens.colors.teal[500]} />
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
function BulkLoadPage({ data }: { data: any }) {
  const { bulkHistory } = data;
  const [showModal, setShowModal] = useState(false);
  const totalBulkCredits = bulkHistory.reduce((s: number, b: any) => s + (b.status === "completed" ? Number(b.total) : 0), 0);
  const totalBulkUsers = bulkHistory.reduce((s: number, b: any) => s + (b.status === "completed" ? Number(b.users) : 0), 0);
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
            <div style={{ fontSize: 24, fontWeight: 600, color: tokens.colors.humand[700], letterSpacing: "0.2px" }}>{bulkHistory.length}</div>
            <div style={{ fontSize: 12, color: tokens.semantic.textLighter, marginTop: 4, letterSpacing: "0.2px" }}>Cargas realizadas</div>
          </div>
          <div style={{ textAlign: "center", padding: 16, background: tokens.colors.green[50], borderRadius: tokens.radius.m }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: tokens.colors.green[700], letterSpacing: "0.2px" }}>{fmtNum(totalBulkCredits)}</div>
            <div style={{ fontSize: 12, color: tokens.semantic.textLighter, marginTop: 4, letterSpacing: "0.2px" }}>Créditos cargados total</div>
          </div>
          <div style={{ textAlign: "center", padding: 16, background: tokens.colors.yellow[50], borderRadius: tokens.radius.m }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: tokens.colors.yellow[700], letterSpacing: "0.2px" }}>{fmtNum(totalBulkUsers)}</div>
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
            <Button icon={Upload} onClick={() => { toast.success("Carga masiva procesada exitosamente"); setShowModal(false); }}>Procesar carga</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: INDIVIDUAL CREDIT LOADING
   ════════════════════════════════════════════ */
function IndividualLoadPage({ data, onRefresh }: { data: any; onRefresh: () => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [loadAmount, setLoadAmount] = useState("");
  const [loadReason, setLoadReason] = useState("");
  const [loadNote, setLoadNote] = useState("");
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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
          {successMsg ? (
            <div style={{ padding: 20, textAlign: "center", color: tokens.colors.green[700], background: tokens.colors.green[50], borderRadius: tokens.radius.m }}>
              <CheckCircle size={32} style={{ marginBottom: 8 }} />
              <div style={{ fontWeight: 600, fontSize: 14 }}>{successMsg}</div>
            </div>
          ) : (
            <>
              <FormField label="Cantidad de créditos">
                <Input type="number" placeholder="Ej: 5" value={loadAmount} onChange={(e: any) => setLoadAmount(e.target.value)} />
              </FormField>
              <FormField label="Motivo">
                <Select value={loadReason} onChange={(e: any) => setLoadReason(e.target.value)} options={[
                  { value: "", label: "Seleccionar motivo..." },
                  { value: "bonus", label: "Bonus especial" },
                  { value: "adjustment", label: "Ajuste" },
                  { value: "compensation", label: "Compensación" },
                  { value: "other", label: "Otro" },
                ]} />
              </FormField>
              <FormField label="Nota (opcional)">
                <Input placeholder="Comentario interno sobre la carga" value={loadNote} onChange={(e: any) => setLoadNote(e.target.value)} />
              </FormField>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
                <Button variant="secondary" onClick={() => { setShowModal(false); setSelected(null); }}>Cancelar</Button>
                <Button icon={CreditCard} onClick={handleLoadCredits}>{loadingCredits ? "Cargando..." : "Cargar créditos"}</Button>
              </div>
            </>
          )}
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
    award: <PartyPopper size={size} color={color} />,
    userplus: <UserPlus size={size} color={color} />,
  };
  return icons[type] || <Zap size={size} color={color} />;
}

function AutoRulesPage({ data }: { data: any }) {
  const { autoRules, ruleTypes } = data;
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState("types");
  const [selectedType, setSelectedType] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState<any>(null);

  const rulesForType = selectedType
    ? autoRules.filter((r: any) => {
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
            <Button icon={Zap} onClick={() => { toast.success("Regla automática creada"); setShowModal(false); }}>Crear regla</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: BENEFITS MANAGEMENT
   ════════════════════════════════════════════ */
function BenefitsPage({ data }: { data: any }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  const filtered = data.benefits.filter((b: any) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.category || "").toLowerCase().includes(search.toLowerCase())
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
            <Card key={b.id} hoverable style={{ cursor: "pointer" }}>
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
            <Button icon={Plus} onClick={() => { toast.success("Beneficio creado exitosamente"); setShowModal(false); }}>Crear beneficio</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════
   PAGE: ANALYTICS
   ════════════════════════════════════════════ */
function AnalyticsPage({ data }: { data: any }) {
  const [period, setPeriod] = useState("month");

  const topBenefits = [...data.benefits].sort((a: any, b: any) => b.redemptions - a.redemptions).slice(0, 5);
  const topUsers = [...data.users].sort((a: any, b: any) => b.spent - a.spent).slice(0, 5);

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
        <StatCard label="Usuarios activos" value={String(data.users.filter((u:any) => u.status === 'active').length)} icon={Users} trend={`${data.employees.length} colaboradores`} trendUp color={tokens.colors.humand[500]} />
        <StatCard label="Canjes totales" value={String(data.transactions.filter((t:any) => t.type === 'debit').length)} icon={Gift} trend={`$${fmtNum(data.totalRedeemed)} en créditos`} trendUp color={tokens.colors.green[600]} />
        <StatCard label="Promedio canjes/usuario" value={data.employees.length > 0 ? (data.transactions.filter((t:any) => t.type === 'debit').length / data.employees.length).toFixed(1) : "0"} icon={BarChart3} trend="por colaborador" trendUp color={tokens.colors.purple[500]} />
        <StatCard label="Créditos asignados" value={fmtNum(data.totalCredited)} icon={Star} trend={`${fmtNum(data.totalPending)} pendientes`} trendUp color={tokens.colors.yellow[500]} />
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
            <BarChart data={data.deptUsage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={tokens.semantic.borderLight} />
              <XAxis type="number" tick={{ fontSize: 12, fill: tokens.semantic.textLighter }} domain={[0, 100]} />
              <YAxis type="category" dataKey="dept" tick={{ fontSize: 12, fill: tokens.semantic.textLighter }} width={80} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, fontFamily: "Roboto" }} formatter={v => `${v}%`} />
              <Bar dataKey="usage" radius={[0, 4, 4, 0]} name="Uso %">
                {data.deptUsage.map((d: any, i: number) => (
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
  const data = useAdminData();

  const isBenefitsPage = benefitsSubNav.some(s => s.key === activePage);

  if (data.loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: tokens.semantic.bgPage, ...baseStyles }}>
        <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease-out" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${tokens.colors.humand[500]}, ${tokens.colors.purple[500]})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 16, margin: "0 auto 20px",
            letterSpacing: "0.2px", animation: "pulse 1.5s ease-in-out infinite",
            boxShadow: tokens.shadow.glow,
          }}>hu</div>
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
      case "dashboard": return <DashboardPage data={data} />;
      case "bulk": return <BulkLoadPage data={data} />;
      case "individual": return <IndividualLoadPage data={data} onRefresh={data.refresh} />;
      case "auto": return <AutoRulesPage data={data} />;
      case "benefits": return <BenefitsPage data={data} />;
      case "analytics": return <AnalyticsPage data={data} />;
      default: return <DashboardPage data={data} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: tokens.semantic.bgPage, ...baseStyles }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarCollapsed ? 72 : 260,
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderRight: `1px solid ${tokens.semantic.borderLight}`,
        display: "flex", flexDirection: "column", transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)", flexShrink: 0,
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{
          padding: sidebarCollapsed ? "20px 16px" : "20px 24px",
          display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${tokens.semantic.borderLight}`,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: tokens.radius.m,
            background: `linear-gradient(135deg, ${tokens.colors.humand[500]}, ${tokens.colors.purple[500]})`,
            display: "flex", alignItems: "center", justifyContent: "center",
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
          height: 56,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
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
          <div key={activePage} style={{ maxWidth: 1200, animation: "fadeInUp 0.25s ease-out" }}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
