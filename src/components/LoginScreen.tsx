import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  Building2, 
  Users, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Eye, 
  EyeOff, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: UserRole, agentId?: string) => void;
  onVerifyCredentials: (identifier: string, pass: string) => Promise<{ success: boolean; errorMsg?: string; role?: UserRole; agentId?: string; name?: string }>;
}

export default function LoginScreen({ onLogin, onVerifyCredentials }: LoginScreenProps) {
  // Login form states (strictly empty/blank by default, no prefilled demo credentials)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const result = await onVerifyCredentials(identifier, password);
      setIsLoading(false);
      if (result.success) {
        onLogin(result.role!, result.agentId);
      } else {
        setErrorMsg(result.errorMsg || 'Invalid credentials.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'An error occurred during authentication.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] text-stone-800 flex flex-col justify-between antialiased font-sans relative overflow-hidden">
      {/* Subtle Warm Backdrop */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-25%] left-[-10%] w-[60%] h-[110%] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[90%] rounded-full bg-stone-500/5 blur-[120px]" />
      </div>

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 md:py-16 z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 flex-grow items-center">
        
        {/* Left Side: Editorial Overview */}
        <div className="lg:col-span-7 space-y-6 lg:pr-6 flex flex-col justify-center">
          
          {/* Logo & Headline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-white font-serif font-semibold text-lg select-none shadow-sm">
                P
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                  SBR Sponsors Gateway
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 font-serif mt-1">
                  SBR <span className="text-emerald-800 font-normal">Sponsors</span>
                </h1>
              </div>
            </div>
            
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-xl font-sans">
              Welcome to the SBR operations terminal. This portal serves as the unified network pipeline mapping sales volume, team lines, and commission ledgers for authorized sourcing channel partners and managers.
            </p>
          </div>

          {/* SBR Sizing Rules card */}
          <div className="p-5 border border-stone-200/80 bg-white rounded-2xl shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-stone-850 uppercase tracking-widest flex items-center gap-1.5 font-sans">
              <span className="text-emerald-600">✦</span> Sourcing Standard Ledger Rules
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              <strong className="text-stone-900">Tiered Points System.</strong> Points are calculated from plot sizes in square yards (e.g. up to 80 sq yds = 1.0 Point; 81-130 = 2.0 Points; 131-180 = 3.0 Points; up to 10.0 Points for 481-530 sq yds). All real estate transactions, team override bonuses, and final monthly commission payouts are calculated, logged, and tracked strictly in points (PTS) for operations consistency.
            </p>
          </div>

        </div>

        {/* Right Side: Simple Clean Login Card */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-stone-200 shadow-md rounded-2xl p-6 sm:p-8 space-y-6">
            
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-stone-900 font-serif">Security Gateway</h2>
              <p className="text-stone-500 text-xs mt-0.5">
                Enter your Username to authenticate.
              </p>
            </div>

            {/* Actual Form */}
            <form onSubmit={handleFormLogin} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block font-sans">
                  Username
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder=""
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-800/10 focus:border-emerald-800 text-stone-900 outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block font-sans">
                    Security Passcode
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 pl-3.5 pr-10 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-800/10 focus:border-emerald-800 text-stone-900 outline-none font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-stone-400 hover:text-stone-800 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] leading-relaxed">
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate & Enter Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            {/* Compliance Note */}
            <div className="border-t border-stone-200 pt-4">
              <div className="flex items-start gap-2.5 text-[10.5px] text-stone-500 leading-normal font-sans">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p>
                  Secure gateway session. Double-tier auditing maintains transparency across all level structures.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="bg-stone-100 border-t border-stone-200/80 py-6 px-4 md:px-6 shrink-0 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
          <p>© 2026 SBR Associates. SBR Sponsors Sourcing Operations. All rights reserved.</p>
          <div className="flex gap-4 justify-center text-stone-400">
            <span>Support: helpdesk@propspire.in</span>
            <span>|</span>
            <span>Policy: Official SBR Compliance</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
