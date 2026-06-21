"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      // Redirect straight into our new dashboard shell path
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060608] text-white p-6 relative overflow-hidden">
      {/* Premium dark-gold radial ambient glow behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Pure Custom Wrapper (Bypassing theme defaults) */}
      <div className="w-full max-w-md bg-[#0a0a0c] border border-neutral-800 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden">
        
        <div className="space-y-2 text-center pt-10 pb-6">
          <h1 className="text-2xl font-serif tracking-[0.25em] text-[#D4AF37]">
            AURAMOTO OS
          </h1>
          <p className="text-neutral-500 text-[10px] tracking-[0.15em] uppercase font-sans">
            Internal Studio Management System
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="px-8 pb-10">
          <div className="space-y-5">
            
            {/* Username/Email Input Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase font-sans">
                Security ID / Email
              </label>
              <Input
                type="email"
                placeholder="admin@auramoto.studio"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black/50 border-neutral-800 text-white placeholder:text-neutral-700 focus-visible:ring-[#D4AF37]/50 focus-visible:ring-1 focus-visible:border-[#D4AF37] h-11 rounded-lg"
              />
            </div>
            
            {/* Password Input Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase font-sans">
                Access Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-black/50 border-neutral-800 text-white placeholder:text-neutral-700 focus-visible:ring-[#D4AF37]/50 focus-visible:ring-1 focus-visible:border-[#D4AF37] h-11 rounded-lg"
              />
            </div>

            {/* Submit Section */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#D4AF37] hover:bg-[#bfa032] text-black font-semibold uppercase tracking-widest text-xs h-11 rounded-lg transition-all duration-300 active:scale-[0.98]"
              >
                {isLoading ? "Validating Credentials..." : "Initialize Session"}
              </Button>
              <p className="text-[9px] text-center text-neutral-600 tracking-widest uppercase mt-4 selection:bg-transparent">
                Authorized System Personnel Only
              </p>
            </div>

          </div>
        </form>
      </div>
    </main>
  );
}