"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { jsPDF } from "jspdf";
import { 
  Users, 
  ClipboardList, 
  Package, 
  IndianRupee, 
  LayoutDashboard, 
  LogOut, 
  Car,
  Plus,
  Search,
  ArrowRight,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Receipt,
  MessageCircle,
  Filter,
  CheckCircle2,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// --- OFFICIAL STUDIO PRICING CATALOG (No GST) ---
const serviceCatalog: Record<string, Record<string, number>> = {
  "Exterior Wash": { Hatchback: 149, Sedan: 179, SUV: 199 },
  "Wash + Vacuum": { Hatchback: 299, Sedan: 299, SUV: 349 },
  "Premium Foam Wash": { Hatchback: 399, Sedan: 399, SUV: 499 },
  "Interior Deep Cleaning": { Hatchback: 1299, Sedan: 1499, SUV: 1799 },
  "Seat Shampooing": { Hatchback: 899, Sedan: 1099, SUV: 1299 },
  "Silver Refresh": { Hatchback: 999, Sedan: 1199, SUV: 1399 },
  "Gold Detail": { Hatchback: 2299, Sedan: 2699, SUV: 3199 },
  "Platinum Detail": { Hatchback: 4499, Sedan: 5499, SUV: 6499 },
  "Paint Enhancement Polish": { Hatchback: 1999, Sedan: 2499, SUV: 3499 },
  "Paint Correction": { Hatchback: 4999, Sedan: 6999, SUV: 8999 },
  "Ceramic Lite": { Hatchback: 6999, Sedan: 8999, SUV: 10999 },
  "Premium Ceramic": { Hatchback: 12999, Sedan: 15999, SUV: 18999 },
  "Premium Ceramic + Paint Correction": { Hatchback: 16999, Sedan: 19999, SUV: 23999 },
  "Headlight Restoration": { Hatchback: 799, Sedan: 799, SUV: 799 },
  "Glass Polishing": { Hatchback: 999, Sedan: 999, SUV: 999 },
  "Water Spot Removal": { Hatchback: 999, Sedan: 999, SUV: 999 },
  "Trim Restoration": { Hatchback: 799, Sedan: 799, SUV: 799 },
  "Alloy Wheel Detailing": { Hatchback: 799, Sedan: 799, SUV: 799 },
  "Rain Repellent Treatment": { Hatchback: 999, Sedan: 999, SUV: 999 },
  "Pet Hair Removal": { Hatchback: 499, Sedan: 499, SUV: 499 },
  "Underbody Cleaning": { Hatchback: 699, Sedan: 699, SUV: 699 },
  "Roof Liner Cleaning": { Hatchback: 499, Sedan: 499, SUV: 499 },
  "Odour Removal Treatment": { Hatchback: 499, Sedan: 499, SUV: 499 },
  "Engine Bay Cleaning": { Hatchback: 699, Sedan: 699, SUV: 699 },
};

// --- IMAGE LOADER UTILITY (Moved outside component for global TS access) ---
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
};

export default function DashboardPage() {
  // --- AUTHENTICATION STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");

  // --- LIVE CLOUD STATE ---
  const [customers, setCustomers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  // --- FORM STATES ---
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newVehicle, setNewVehicle] = useState("");
  const [newPlate, setNewPlate] = useState("");
  
  const [invCustomer, setInvCustomer] = useState("");
  const [invVehicleType, setInvVehicleType] = useState<"Hatchback" | "Sedan" | "SUV">("SUV");
  const [invService, setInvService] = useState("Premium Foam Wash");
  const [invAmount, setInvAmount] = useState("");

  const [jobCustomer, setJobCustomer] = useState("");
  const [jobVehicleType, setJobVehicleType] = useState<"Hatchback" | "Sedan" | "SUV">("SUV");
  const [jobService, setJobService] = useState("Premium Foam Wash");
  const [jobStatus, setJobStatus] = useState("scheduled");
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  const [invtName, setInvtName] = useState("");
  const [invtCategory, setInvtCategory] = useState("Consumables");
  const [invtQty, setInvtQty] = useState("");
  const [invtPrice, setInvtPrice] = useState("");
  const [invtDate, setInvtDate] = useState("");

  const [expDesc, setExpDesc] = useState("");
  const [expCategory, setExpCategory] = useState("Salary & Wages");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState("");

  const [dateFilter, setDateFilter] = useState("this_month"); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Check persistent session on load
  useEffect(() => {
    const session = localStorage.getItem("auramoto_session");
    if (session === "active") {
      setIsAuthenticated(true);
      fetchAllData();
    }
  }, []);

  useEffect(() => {
    if (invService && invVehicleType) {
      const price = serviceCatalog[invService]?.[invVehicleType];
      if (price) setInvAmount(price.toString());
    }
  }, [invService, invVehicleType]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const systemPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "AuraMoto2026";
    if (passwordInput === systemPassword) {
      setIsAuthenticated(true);
      setLoginError(false);
      localStorage.setItem("auramoto_session", "active");
      fetchAllData();
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("auramoto_session");
  };

  const fetchAllData = async () => {
    const { data: custData } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (custData) setCustomers(custData);
    const { data: jobsData } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (jobsData) setJobs(jobsData);
    const { data: invData } = await supabase.from('inventory').select('*');
    if (invData) setInventory(invData);
    const { data: invoiceData } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    if (invoiceData) setInvoices(invoiceData);
    const { data: expData } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    if (expData) setExpenses(expData);
  };

  const getFilteredData = (dataArray: any[], dateField: string) => {
    const now = new Date();
    return dataArray.filter(item => {
      if (dateFilter === "all") return true;
      const itemDate = new Date(item[dateField]);
      if (isNaN(itemDate.getTime())) return true;
      
      if (dateFilter === "this_week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return itemDate >= weekAgo && itemDate <= now;
      }
      if (dateFilter === "this_month") {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      }
      if (dateFilter === "custom") {
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);
        return itemDate >= start && itemDate <= end;
      }
      return true;
    });
  };

  const filteredInvoices = getFilteredData(invoices, 'date');
  const filteredExpenses = getFilteredData(expenses, 'date');

  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const netProfit = totalRevenue - totalExpenses;

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newVehicle) return;
    const type = newVehicle.toLowerCase().includes("rover") || newVehicle.toLowerCase().includes("bmw") || newVehicle.toLowerCase().includes("mercedes") ? "Premium" : "Standard";
    await supabase.from('customers').insert([{ name: newName, phone: newPhone, vehicle: newVehicle, plate: newPlate.toUpperCase(), type: type }]);
    setNewName(""); setNewPhone(""); setNewVehicle(""); setNewPlate("");
    fetchAllData();
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobCustomer || !jobService) return;
    const customerRecord = customers.find(c => c.name === jobCustomer);
    const vehicle = customerRecord ? customerRecord.vehicle : "Unknown Vehicle";
    const newJobId = `JOB-${1000 + jobs.length + 1}`;
    await supabase.from('jobs').insert([{ id: newJobId, customer: jobCustomer, vehicle: vehicle, service: `${jobService} (${jobVehicleType})`, status: jobStatus }]);
    setJobCustomer(""); setJobService("Premium Foam Wash"); setJobStatus("scheduled");
    setIsJobModalOpen(false);
    fetchAllData();
  };

  const advanceJob = async (jobId: string, currentStatus: string) => {
    const stagesList = ["scheduled", "in_progress", "quality_check", "ready", "completed"];
    const currentIndex = stagesList.indexOf(currentStatus);
    if (currentIndex > -1 && currentIndex < stagesList.length - 1) {
      const nextStatus = stagesList[currentIndex + 1];
      await supabase.from('jobs').update({ status: nextStatus }).eq('id', jobId);
      fetchAllData();
    }
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invCustomer || !invAmount) return;
    const dateStr = new Date().toISOString().split('T')[0]; 
    await supabase.from('invoices').insert([{ id: `AM-${1000 + invoices.length + 1}`, customer: invCustomer, service: `${invService} (${invVehicleType})`, amount: parseFloat(invAmount), status: "Pending", date: dateStr }]);
    setInvCustomer(""); setInvAmount("");
    fetchAllData();
  };

  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invtName || !invtQty || !invtPrice || !invtDate) return;
    const parsedQty = parseInt(invtQty);
    const parsedPrice = parseFloat(invtPrice);
    await supabase.from('inventory').insert([{ id: `INV-${1000 + inventory.length + 1}`, name: invtName, category: invtCategory, qty: parsedQty, unit: "Units", status: parsedQty < 5 ? "low" : "good", price: parsedPrice, purchase_date: invtDate }]);
    await supabase.from('expenses').insert([{ id: `EXP-${Date.now()}`, description: `Stock: ${invtName}`, category: "Inventory Purchase", amount: parsedPrice, date: invtDate }]);
    setInvtName(""); setInvtQty(""); setInvtPrice(""); setInvtDate("");
    fetchAllData();
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc || !expAmount || !expDate) return;
    await supabase.from('expenses').insert([{ id: `EXP-${Date.now()}`, description: expDesc, category: expCategory, amount: parseFloat(expAmount), date: expDate }]);
    setExpDesc(""); setExpAmount(""); setExpDate("");
    fetchAllData();
  };

  const shareToWhatsApp = (inv: any) => {
    const custRecord = customers.find(c => c.name === inv.customer);
    let phone = custRecord ? custRecord.phone : "";
    phone = phone.replace(/\D/g,'');
    if(phone.length === 10) phone = `91${phone}`;
    const text = `*AuraMoto Detailing Studio* 🚗✨\n\nHello ${inv.customer},\nThank you for choosing us! Here are your service details:\n\n*Invoice #*: ${inv.id}\n*Service*: ${inv.service}\n*Total Amount*: ₹${Number(inv.amount).toLocaleString('en-IN')}\n\nWe'd love to hear about your experience! Please leave us a review: https://g.page/r/example\nVisit our website: www.auramotostudio.com\n\n🎁 *Special Offer:* Get 10% off your next wash! Show this message at the studio.`;
    window.open(phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const downloadInvoice = async (inv: any) => {
    const doc = new jsPDF();
    try {
      const logoImg = await loadImage('/icon.png');
      doc.addImage(logoImg, 'PNG', 15, 12, 25, 12); 
    } catch (e) { console.warn(e); }

    doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(212, 175, 55); 
    doc.text("AuraMoto Detailing Studio", 45, 18);
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(100, 100, 100);
    doc.text("Premium Automotive Detailing & Care", 45, 23).text("Dabra Studio, Madhya Pradesh", 45, 28);
    doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(40, 40, 40).text("INVOICE", 155, 18);
    doc.setFont("helvetica", "normal").setFontSize(9).text(`Invoice #: ${inv.id}`, 155, 24).text(`Date: ${inv.date}`, 155, 29).text(`Status: ${inv.status.toUpperCase()}`, 155, 34);
    doc.setDrawColor(212, 175, 55).setLineWidth(0.5).line(15, 42, 195, 42);
    doc.setFont("helvetica", "bold").setTextColor(40, 40, 40).text("BILLED TO:", 15, 55);
    doc.setFont("helvetica", "normal").text(inv.customer, 15, 61);
    
    const custRecord = customers.find(c => c.name === inv.customer);
    if (custRecord) {
      doc.text(`Vehicle: ${custRecord.vehicle}`, 15, 67).text(`License Plate: ${custRecord.plate}`, 15, 73).text(`Phone: ${custRecord.phone}`, 15, 79);
    }

    doc.setFillColor(10, 10, 12).rect(15, 95, 180, 10, "F");
    doc.setTextColor(255, 255, 255).setFont("helvetica", "bold").text("SERVICE DESCRIPTION", 20, 101.5).text("TOTAL AMOUNT", 160, 101.5);
    doc.setTextColor(40, 40, 40).setFont("helvetica", "normal").text(inv.service, 20, 115).text(`Rs. ${inv.amount.toLocaleString('en-IN')}`, 160, 115);
    doc.setDrawColor(230, 230, 230).line(15, 125, 195, 125);
    doc.setFont("helvetica", "bold").setFontSize(11).text("GRAND TOTAL:", 125, 145).setTextColor(212, 175, 55).text(`Rs. ${inv.amount.toLocaleString('en-IN')}`, 160, 145);

    try {
      const sigImg = await loadImage('/AM signature.png');
      doc.addImage(sigImg, 'PNG', 130, 220, 50, 12); 
    } catch (e) { console.warn(e); }

    doc.setTextColor(150, 150, 150).setFont("helvetica", "normal").setFontSize(8).text("Thank you for choosing AuraMoto.", 105, 270, { align: "center" }).text("This is a system-generated invoice.", 105, 275, { align: "center" });
    doc.save(`${inv.id}_AuraMoto_Invoice.pdf`);
  };

  const stages = [
    { id: "scheduled", label: "Scheduled" },
    { id: "in_progress", label: "In Progress" },
    { id: "quality_check", label: "Quality Check" },
    { id: "ready", label: "Ready for Pickup" }
  ];

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "customers", label: "Customer CRM", icon: Users },
    { id: "jobs", label: "Active Jobs", icon: ClipboardList },
    { id: "inventory", label: "Stock Analysis", icon: Package },
    { id: "finances", label: "Finance & Bills", icon: Receipt },
    { id: "pnl", label: "Expenses & P&L", icon: TrendingUp },
  ];

  const RenderDateFilter = () => (
    <div className="flex items-center gap-2 bg-neutral-900/50 p-1.5 rounded-lg border border-neutral-800">
      <Filter className="w-3.5 h-3.5 text-neutral-400 ml-2" />
      <select value={dateFilter} onChange={(e)=>setDateFilter(e.target.value)} className="bg-transparent text-[11px] text-white focus:outline-none appearance-none cursor-pointer tracking-wider pr-2">
        <option value="all" className="bg-[#0a0a0c]">All Time</option>
        <option value="this_week" className="bg-[#0a0a0c]">This Week</option>
        <option value="this_month" className="bg-[#0a0a0c]">This Month</option>
        <option value="custom" className="bg-[#0a0a0c]">Custom Range...</option>
      </select>
      {dateFilter === "custom" && (
        <div className="flex items-center gap-2 border-l border-neutral-800 pl-2">
          <Input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="h-6 text-[10px] w-28 bg-black/50 border-neutral-800 text-neutral-300" />
          <span className="text-neutral-500 text-[10px]">to</span>
          <Input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="h-6 text-[10px] w-28 bg-black/50 border-neutral-800 text-neutral-300" />
        </div>
      )}
    </div>
  );

  // --- RENDER LOGIN GATING OVERLAY ---
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen bg-[#040406] flex items-center justify-center relative font-sans text-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />
        <Card className="w-full max-w-sm bg-[#0a0a0c] border-neutral-900 shadow-2xl p-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <div className="p-3 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/20 text-[#D4AF37] mb-1">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-serif tracking-[0.2em] text-[#D4AF37]">AURAMOTO OS</h2>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Administrative Verification Required</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-neutral-400">Security Key</label>
              <Input 
                type="password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)} 
                placeholder="••••••••" 
                className="bg-black/60 border-neutral-800 text-center text-white tracking-widest h-10" 
                required 
              />
            </div>
            {loginError && <p className="text-[11px] text-red-400 text-center tracking-wide font-medium">Invalid Administrative Key</p>}
            <Button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#bfa032] text-black font-semibold text-xs uppercase tracking-widest h-10 transition-all">
              Initialize Console
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#060608] text-white overflow-hidden font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#0a0a0c] border-r border-neutral-900 flex flex-col justify-between z-20 shrink-0">
        <div>
          <div className="p-6 border-b border-neutral-900">
            <h2 className="text-lg font-serif tracking-[0.2em] text-[#D4AF37]">AURAMOTO OS</h2>
            <p className="text-[9px] text-neutral-500 tracking-wider uppercase mt-1">Studio Command Center</p>
          </div>
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
                    isActive 
                      ? "bg-[#D4AF37] text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.2)]" 
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-neutral-900">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium tracking-wider uppercase text-neutral-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

        <header className="h-16 border-b border-neutral-900 bg-[#0a0a0c]/40 backdrop-blur-md flex items-center justify-between px-8 z-10 sticky top-0 shrink-0">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs tracking-widest text-neutral-400 uppercase font-medium">
              Location: <span className="text-white font-semibold">Dabra Studio</span>
            </span>
          </div>
          <div className="text-[11px] tracking-wider text-neutral-500 uppercase">
            Active User: <span className="text-[#D4AF37] font-medium">Nishant (Admin)</span>
          </div>
        </header>

        <div className="p-8 relative z-10 flex-1 overflow-y-auto">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-serif tracking-wider text-white">STUDIO METRICS OVERVIEW</h1>
                    <p className="text-xs text-neutral-500 mt-1">Real-time breakdown of operational efficiency and profitability.</p>
                  </div>
                  <RenderDateFilter />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                 <div className="bg-[#0a0a0c] border border-neutral-900 p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">Filtered Revenue</p>
                        <p className="text-2xl font-semibold text-white mt-2 font-mono">₹{totalRevenue.toLocaleString('en-IN')}</p>
                      </div>
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                 </div>

                 <div className="bg-[#0a0a0c] border border-neutral-900 p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">Filtered Expenses</p>
                        <p className="text-2xl font-semibold text-white mt-2 font-mono">₹{totalExpenses.toLocaleString('en-IN')}</p>
                      </div>
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    </div>
                 </div>

                 <div className="bg-[#0a0a0c] border border-[#D4AF37]/30 p-6 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-medium">Net Profit</p>
                        <p className="text-3xl font-semibold text-white mt-2 font-mono">₹{netProfit.toLocaleString('en-IN')}</p>
                      </div>
                      <IndianRupee className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                 </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {[
                  { title: "Active Bays", value: `${jobs.filter(j => j.status !== "completed").length} Vehicles`, desc: "In studio workflow" },
                  { title: "Low Stock Alert", value: `${inventory.filter(i => i.status !== "good").length} Items`, desc: "Requires reorder" },
                  { title: "Pending Pickups", value: `${jobs.filter(j => j.status === "ready").length} Cars`, desc: "Awaiting client checkout" }
                ].map((stat, i) => (
                  <div key={i} className="bg-[#0a0a0c] border border-neutral-900 p-5 rounded-xl">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">{stat.title}</p>
                    <p className="text-xl font-semibold text-white mt-2 font-mono tracking-tight">{stat.value}</p>
                    <p className="text-[10px] text-neutral-600 mt-1">{stat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CRM TAB */}
          {activeTab === "customers" && (
             <div className="space-y-6 animate-in fade-in duration-300">
               <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-serif tracking-wider text-white">CUSTOMER PROFILE DIRECTORY</h1>
                  <p className="text-xs text-neutral-500 mt-1">Manage client records, vehicles, and contact information.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-[#0a0a0c] border-neutral-900 text-white lg:col-span-1 shadow-xl">
                  <CardHeader className="border-b border-neutral-900 pb-4">
                    <CardTitle className="text-sm tracking-widest uppercase text-[#D4AF37] flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add New Client
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handleAddCustomer} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Client Name</label>
                        <Input value={newName} onChange={(e)=>setNewName(e.target.value)} placeholder="e.g. Aman Khurana" className="bg-black/50 border-neutral-800 h-9 text-sm text-white" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Phone Number</label>
                        <Input value={newPhone} onChange={(e)=>setNewPhone(e.target.value)} placeholder="9876543210" className="bg-black/50 border-neutral-800 h-9 text-sm text-white" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Vehicle Make & Model</label>
                        <Input value={newVehicle} onChange={(e)=>setNewVehicle(e.target.value)} placeholder="e.g. Ford Endeavour" className="bg-black/50 border-neutral-800 h-9 text-sm text-white" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-wider text-neutral-400 uppercase">License Plate</label>
                        <Input value={newPlate} onChange={(e)=>setNewPlate(e.target.value)} placeholder="MP-07-AB-1234" className="bg-black/50 border-neutral-800 h-9 text-sm uppercase text-white" required />
                      </div>
                      <Button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#bfa032] text-black text-xs tracking-widest uppercase font-semibold h-10 mt-2">
                        Register Client
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0c] border-neutral-900 text-white lg:col-span-2 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[10px] text-neutral-400 uppercase bg-neutral-900/50 border-b border-neutral-800">
                        <tr>
                          <th className="px-6 py-4 font-medium tracking-wider">Client Details</th>
                          <th className="px-6 py-4 font-medium tracking-wider">Vehicle</th>
                          <th className="px-6 py-4 font-medium tracking-wider">Plate No.</th>
                          <th className="px-6 py-4 font-medium tracking-wider text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900">
                        {customers.map((customer) => (
                          <tr key={customer.id} className="hover:bg-neutral-900/20 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-medium text-white">{customer.name}</p>
                              <p className="text-xs text-neutral-500 mt-0.5">{customer.phone}</p>
                            </td>
                            <td className="px-6 py-4 text-neutral-300">{customer.vehicle}</td>
                            <td className="px-6 py-4 text-neutral-400 font-mono text-xs">{customer.plate}</td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-[9px] uppercase tracking-wider font-medium ${
                                customer.type === "Premium" ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20" : "bg-neutral-800 text-neutral-300 border border-neutral-700"
                              }`}>
                                {customer.type}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
             </div>
          )}

          {/* JOBS TAB */}
          {activeTab === "jobs" && (
             <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
              <div className="flex items-center justify-between shrink-0">
                <div>
                  <h1 className="text-xl font-serif tracking-wider text-white">UNIVERSAL BAY TRACKER</h1>
                  <p className="text-xs text-neutral-500 mt-1">Monitor vehicles moving through studio operations.</p>
                </div>
                
                <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs tracking-widest uppercase h-9">
                      <Plus className="w-4 h-4 mr-2" /> New Job Ticket
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#0a0a0c] border border-neutral-800 text-white shadow-2xl sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-[#D4AF37] font-serif tracking-widest uppercase text-lg">Create Job Ticket</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddJob} className="space-y-4 pt-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Select Client</label>
                        <select value={jobCustomer} onChange={(e) => setJobCustomer(e.target.value)} className="w-full bg-black/50 border border-neutral-800 rounded-md h-9 text-sm px-3 text-white focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none appearance-none" required>
                          <option value="" disabled>Choose client...</option>
                          {customers.map(c => <option key={c.id} value={c.name}>{c.name} ({c.vehicle})</option>)}
                        </select>
                      </div>
                      <div className="flex gap-3">
                        <div className="space-y-1.5 w-1/3">
                          <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Category</label>
                          <select value={jobVehicleType} onChange={(e)=>setJobVehicleType(e.target.value as any)} className="w-full bg-black/50 border border-neutral-800 rounded-md h-9 text-sm px-3 text-white focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none appearance-none" required>
                            <option value="Hatchback">Hatchback</option><option value="Sedan">Sedan</option><option value="SUV">SUV</option>
                          </select>
                        </div>
                        <div className="space-y-1.5 w-2/3">
                          <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Service Required</label>
                          <select value={jobService} onChange={(e)=>setJobService(e.target.value)} className="w-full bg-black/50 border border-neutral-800 rounded-md h-9 text-sm px-3 text-white focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none appearance-none" required>
                            {Object.keys(serviceCatalog).map(service => (<option key={service} value={service}>{service}</option>))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Initial Stage</label>
                        <select value={jobStatus} onChange={(e) => setJobStatus(e.target.value)} className="w-full bg-black/50 border border-neutral-800 rounded-md h-9 text-sm px-3 text-white focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none appearance-none" required>
                          <option value="scheduled">Scheduled</option><option value="in_progress">In Progress</option><option value="quality_check">Quality Check</option>
                        </select>
                      </div>
                      <Button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#bfa032] text-black text-xs tracking-widest uppercase font-semibold h-10 mt-2">Allocate Bay</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 pt-2 flex-1 items-start">
                {stages.map((stage) => (
                  <div key={stage.id} className="min-w-[280px] w-[280px] bg-neutral-900/30 border border-neutral-800 rounded-xl flex flex-col max-h-full">
                    <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50 rounded-t-xl shrink-0">
                      <h3 className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">{stage.label}</h3>
                      <span className="bg-black text-neutral-400 text-[10px] px-2 py-0.5 rounded-full border border-neutral-800">
                        {jobs.filter(j => j.status === stage.id).length}
                      </span>
                    </div>
                    <div className="p-3 flex flex-col gap-3 overflow-y-auto">
                      {jobs.filter(j => j.status === stage.id).map(job => (
                        <div key={job.id} className="bg-[#0a0a0c] border border-neutral-800 rounded-lg p-4 shadow-lg group hover:border-neutral-600 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] text-neutral-500 tracking-wider font-mono">{job.id}</span>
                            <Clock className="w-3 h-3 text-neutral-600" />
                          </div>
                          <p className="font-semibold text-sm text-white mb-0.5">{job.vehicle}</p>
                          <p className="text-[11px] text-neutral-400 mb-3">{job.customer}</p>
                          <div className="bg-neutral-900/50 px-2 py-1.5 rounded text-[10px] text-neutral-300 border border-neutral-800 mb-3">{job.service}</div>
                          {stage.id !== "ready" ? (
                            <button onClick={() => advanceJob(job.id, job.status)} className="w-full flex items-center justify-center gap-2 py-1.5 rounded bg-neutral-800/50 text-neutral-400 text-[10px] uppercase tracking-wider hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-colors border border-transparent hover:border-[#D4AF37]/20 opacity-0 group-hover:opacity-100">
                              Move to Next Stage <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <button onClick={() => advanceJob(job.id, job.status)} className="w-full flex items-center justify-center gap-2 py-1.5 rounded bg-emerald-900/30 text-emerald-400 text-[10px] uppercase tracking-wider hover:bg-emerald-900/60 transition-colors border border-transparent hover:border-emerald-900/50 opacity-0 group-hover:opacity-100">
                              Mark as Delivered <CheckCircle2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC INVENTORY TAB */}
          {activeTab === "inventory" && (
             <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-serif tracking-wider text-white">STOCK ANALYSIS & PURCHASING</h1>
                  <p className="text-xs text-neutral-500 mt-1">Log new stock deliveries. Purchases automatically sync to your P&L Expenses.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-[#0a0a0c] border-neutral-900 text-white lg:col-span-1 shadow-xl">
                  <CardHeader className="border-b border-neutral-900 pb-4">
                    <CardTitle className="text-sm tracking-widest uppercase text-[#D4AF37] flex items-center gap-2"><Package className="w-4 h-4" /> Log Delivery</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handleAddInventory} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Product Name</label>
                        <Input value={invtName} onChange={(e)=>setInvtName(e.target.value)} placeholder="e.g. System X Ceramic 50ml" className="bg-black/50 border-neutral-800 h-9 text-sm text-white" required />
                      </div>
                      <div className="flex gap-3">
                        <div className="space-y-1.5 w-1/2">
                          <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Category</label>
                          <select value={invtCategory} onChange={(e)=>setInvtCategory(e.target.value)} className="w-full bg-black/50 border border-neutral-800 rounded-md h-9 text-sm px-3 text-white focus:ring-1 focus:ring-[#D4AF37]/50 appearance-none" required>
                            <option>Coatings</option><option>Compounds</option><option>Chemicals</option><option>Consumables</option><option>Equipment</option>
                          </select>
                        </div>
                        <div className="space-y-1.5 w-1/2">
                          <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Qty Added</label>
                          <Input type="number" value={invtQty} onChange={(e)=>setInvtQty(e.target.value)} placeholder="5" className="bg-black/50 border-neutral-800 h-9 text-sm text-white" required />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="space-y-1.5 w-1/2">
                          <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Total Bill (₹)</label>
                          <Input type="number" value={invtPrice} onChange={(e)=>setInvtPrice(e.target.value)} placeholder="15000" className="bg-black/50 border-neutral-800 h-9 text-sm text-white font-mono" required />
                        </div>
                        <div className="space-y-1.5 w-1/2">
                          <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Date of Purchase</label>
                          <Input type="date" value={invtDate} onChange={(e)=>setInvtDate(e.target.value)} className="bg-black/50 border-neutral-800 h-9 text-sm text-white block" required />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#bfa032] text-black text-xs tracking-widest uppercase font-semibold h-10 mt-2">Add to Stock & Ledger</Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0c] border-neutral-900 text-white lg:col-span-2 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[10px] text-neutral-400 uppercase bg-neutral-900/50 border-b border-neutral-800">
                        <tr>
                          <th className="px-6 py-4 font-medium tracking-wider">Product & Date</th>
                          <th className="px-6 py-4 font-medium tracking-wider">Category</th>
                          <th className="px-6 py-4 font-medium tracking-wider">Purchase Price</th>
                          <th className="px-6 py-4 font-medium tracking-wider text-right">Stock Level</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900">
                        {inventory.map((item) => (
                          <tr key={item.id} className="hover:bg-neutral-900/20 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-medium text-white">{item.name}</p>
                              <p className="text-xs text-neutral-500 mt-0.5">{item.purchase_date || "Legacy Record"}</p>
                            </td>
                            <td className="px-6 py-4"><span className="text-xs text-neutral-400 bg-neutral-800/50 px-2 py-1 rounded border border-neutral-800">{item.category}</span></td>
                            <td className="px-6 py-4"><span className="text-white font-mono text-sm">₹{Number(item.price).toLocaleString('en-IN') || "0"}</span></td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-white font-mono text-sm mr-3">{item.qty} {item.unit}</span>
                              {item.status === "good" ? (
                                <span className="inline-flex items-center px-2 py-1 rounded text-[9px] uppercase tracking-wider font-medium bg-emerald-900/20 text-emerald-400 border border-emerald-900/50">In Stock</span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] uppercase tracking-wider font-medium bg-amber-900/20 text-amber-400 border border-amber-900/50"><AlertTriangle className="w-3 h-3" /> Low</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* EXPENSES & P&L TAB */}
          {activeTab === "pnl" && (
             <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-serif tracking-wider text-white">EXPENSES & PROFITABILITY</h1>
                  <p className="text-xs text-neutral-500 mt-1">Track studio operational costs, salaries, rent, and calculate net profit.</p>
                </div>
                <RenderDateFilter />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-[#0a0a0c] border-neutral-900 text-white lg:col-span-1 shadow-xl">
                  <CardHeader className="border-b border-neutral-900 pb-4">
                    <CardTitle className="text-sm tracking-widest uppercase text-red-400 flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Log Expense</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handleAddExpense} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Expense Description</label>
                        <Input value={expDesc} onChange={(e)=>setExpDesc(e.target.value)} placeholder="e.g. May Studio Rent" className="bg-black/50 border-neutral-800 h-9 text-sm text-white" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Category</label>
                        <select value={expCategory} onChange={(e)=>setExpCategory(e.target.value)} className="w-full bg-black/50 border border-neutral-800 rounded-md h-9 text-sm px-3 text-white focus:ring-1 focus:ring-red-500/50 appearance-none" required>
                          <option>Rent & Lease</option><option>Salary & Wages</option><option>Utilities (Electricity/Water)</option><option>Marketing & Ads</option><option>Maintenance</option><option>Other Expenses</option>
                        </select>
                      </div>
                      <div className="flex gap-3">
                        <div className="space-y-1.5 w-1/2">
                          <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Amount (₹)</label>
                          <Input type="number" value={expAmount} onChange={(e)=>setExpAmount(e.target.value)} placeholder="15000" className="bg-black/50 border-neutral-800 h-9 text-sm text-white font-mono" required />
                        </div>
                        <div className="space-y-1.5 w-1/2">
                          <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Date</label>
                          <Input type="date" value={expDate} onChange={(e)=>setExpDate(e.target.value)} className="bg-black/50 border-neutral-800 h-9 text-sm text-white block" required />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 text-xs tracking-widest uppercase font-semibold h-10 mt-2 transition-colors">Deduct from Ledger</Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0c] border-neutral-900 text-white lg:col-span-2 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[10px] text-neutral-400 uppercase bg-neutral-900/50 border-b border-neutral-800">
                        <tr>
                          <th className="px-6 py-4 font-medium tracking-wider">Date & ID</th>
                          <th className="px-6 py-4 font-medium tracking-wider">Description</th>
                          <th className="px-6 py-4 font-medium tracking-wider">Category</th>
                          <th className="px-6 py-4 font-medium tracking-wider text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900">
                        {filteredExpenses.map((exp) => (
                          <tr key={exp.id} className="hover:bg-neutral-900/20 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-medium text-white">{exp.date}</p>
                              <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">{exp.id.substring(0, 12)}</p>
                            </td>
                            <td className="px-6 py-4 text-neutral-300">{exp.description}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border ${
                                exp.category === "Inventory Purchase" 
                                  ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20" 
                                  : "text-neutral-400 bg-neutral-800/50 border-neutral-800"
                              }`}>{exp.category}</span>
                            </td>
                            <td className="px-6 py-4 text-right"><span className="text-red-400 font-mono text-sm">- ₹{Number(exp.amount).toLocaleString('en-IN')}</span></td>
                          </tr>
                        ))}
                        {filteredExpenses.length === 0 && (
                          <tr><td colSpan={4} className="px-6 py-8 text-center text-neutral-500 text-sm">No expenses logged for this period.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* FINANCE & BILLING TAB */}
          {activeTab === "finances" && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-serif tracking-wider text-white">FINANCE & BILLING RECONCILIATION</h1>
                  <p className="text-xs text-neutral-500 mt-1">Generate client invoices and track studio revenue.</p>
                </div>
                <RenderDateFilter />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-[#0a0a0c] border-neutral-900 text-white lg:col-span-1 shadow-xl">
                  <CardHeader className="border-b border-neutral-900 pb-4">
                    <CardTitle className="text-sm tracking-widest uppercase text-[#D4AF37] flex items-center gap-2"><FileText className="w-4 h-4" /> Create Invoice</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handleGenerateInvoice} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Select Client</label>
                        <select value={invCustomer} onChange={(e)=>setInvCustomer(e.target.value)} className="w-full bg-black/50 border border-neutral-800 rounded-md h-9 text-sm px-3 text-white focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none appearance-none" required>
                          <option value="" disabled>Choose existing client...</option>
                          {customers.map(c => <option key={c.id} value={c.name}>{c.name} ({c.vehicle})</option>)}
                        </select>
                      </div>
                      <div className="flex gap-3">
                        <div className="space-y-1.5 w-1/3">
                          <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Category</label>
                          <select value={invVehicleType} onChange={(e)=>setInvVehicleType(e.target.value as any)} className="w-full bg-black/50 border border-neutral-800 rounded-md h-9 text-sm px-3 text-white focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none appearance-none" required>
                            <option value="Hatchback">Hatchback</option><option value="Sedan">Sedan</option><option value="SUV">SUV</option>
                          </select>
                        </div>
                        <div className="space-y-1.5 w-2/3">
                          <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Studio Service</label>
                          <select value={invService} onChange={(e)=>setInvService(e.target.value)} className="w-full bg-black/50 border border-neutral-800 rounded-md h-9 text-sm px-3 text-white focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none appearance-none" required>
                            {Object.keys(serviceCatalog).map(service => (<option key={service} value={service}>{service}</option>))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-wider text-neutral-400 uppercase">Base Amount (₹)</label>
                        <Input type="number" value={invAmount} onChange={(e)=>setInvAmount(e.target.value)} className="bg-black/50 border-neutral-800 h-9 text-sm text-white font-mono" required />
                      </div>
                      <div className="bg-neutral-900/40 border border-neutral-800 p-4 rounded-lg mt-4">
                        <div className="flex justify-between text-sm text-white font-semibold">
                          <span>Grand Total:</span>
                          <span className="font-mono text-[#D4AF37]">₹{Number(invAmount).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#bfa032] text-black text-xs tracking-widest uppercase font-semibold h-10 mt-2">Generate Bill</Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0c] border-neutral-900 text-white lg:col-span-2 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[10px] text-neutral-400 uppercase bg-neutral-900/50 border-b border-neutral-800">
                        <tr>
                          <th className="px-6 py-4 font-medium tracking-wider">Invoice / Date</th>
                          <th className="px-6 py-4 font-medium tracking-wider">Client & Service</th>
                          <th className="px-6 py-4 font-medium tracking-wider">Amount</th>
                          <th className="px-6 py-4 font-medium tracking-wider text-right">Status / Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900">
                        {filteredInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-neutral-900/20 transition-colors">
                            <td className="px-6 py-4"><p className="font-mono font-medium text-white">{inv.id}</p><p className="text-xs text-neutral-500 mt-0.5">{inv.date}</p></td>
                            <td className="px-6 py-4"><p className="text-sm text-white">{inv.customer}</p><p className="text-[11px] text-neutral-400 mt-0.5 truncate max-w-[200px]">{inv.service}</p></td>
                            <td className="px-6 py-4"><span className="text-white font-mono text-sm">₹{Number(inv.amount).toLocaleString('en-IN')}</span></td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-3">
                                <span className="inline-flex items-center px-2 py-1 rounded text-[9px] uppercase tracking-wider font-medium bg-emerald-900/20 text-emerald-400 border border-emerald-900/50">PAID</span>
                                <button onClick={() => shareToWhatsApp(inv)} className="p-1.5 text-neutral-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded transition-colors" title="Send WhatsApp Link"><MessageCircle className="w-4 h-4" /></button>
                                <button onClick={() => downloadInvoice(inv)} className="p-1.5 text-neutral-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded transition-colors" title="Download PDF"><Download className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredInvoices.length === 0 && (
                          <tr><td colSpan={4} className="px-6 py-8 text-center text-neutral-500 text-sm">No invoices found for this period.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}