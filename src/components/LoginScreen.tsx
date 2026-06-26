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
  users: User[];
  onLogin: (role: UserRole, agentId?: string) => void;
}

export default function LoginScreen({ users, onLogin }: LoginScreenProps) {
  // Login form states
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [emailInput, setEmailInput] = useState('admin@propspire.in');
  const [agentIdInput, setAgentIdInput] = useState('SBR0005');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Quick select credentials helper
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg('');
    if (role === 'ADMIN') {
      setEmailInput('admin@propspire.in');
      setPassword('admin123');
    } else {
      setAgentIdInput('SBR0005');
      setPassword('password');
    }
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsLoading(false);
      if (selectedRole === 'ADMIN') {
        if (emailInput.toLowerCase() === 'admin@propspire.in' && (password === 'admin123' || password === '••••••••')) {
          onLogin('ADMIN');
        } else {
          setErrorMsg('Invalid Administrator credentials. Try: admin@propspire.in / admin123');
        }
      } else {
        const foundAgent = users.find(u => u.id === agentIdInput.trim().toUpperCase());
        if (foundAgent) {
          if (foundAgent.status === 'ACTIVE') {
            onLogin('AGENT', foundAgent.id);
          } else {
            setErrorMsg('Access Blocked: This broker account has been marked INACTIVE by Admin.');
          }
        } else {
          setErrorMsg('Sponsor ID not found in current network. Try SBR0005 or SBR0001.');
        }
      }
    }, 600);
  };

  const selectQuickAgent = (id: string) => {
    setSelectedRole('AGENT');
    setAgentIdInput(id);
    setPassword('password');
    setErrorMsg('');
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
                  SBR CRM Gateway
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 font-serif mt-1">
                  SBR <span className="text-emerald-800 font-normal">CRM</span>
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
              <strong className="text-stone-900">50 Square Yards = 1.0 Point (PTS).</strong> All real estate transactions, team override bonuses, and final monthly commission payouts are calculated, logged, and tracked strictly in points (PTS) for operations consistency.
            </p>
          </div>

          {/* Quick bypassed identities panel */}
          <div className="p-6 border border-amber-200/60 bg-amber-50/40 rounded-2xl space-y-4">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block font-sans">
                Operations Demo Quick-Access
              </span>
              <p className="text-xs text-stone-600 mt-1">
                Select an operational profile to automatically fill the credentials form and test the live application:
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button 
                onClick={() => handleRoleChange('ADMIN')}
                className="p-3 text-left bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-xs transition-all cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <span className="block font-bold text-stone-900">Rajesh Kumar</span>
                  <span className="text-[10px] text-stone-500">Corporate Owner (Admin)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-900 transition-all" />
              </button>

              <button 
                onClick={() => selectQuickAgent('SBR0005')}
                className="p-3 text-left bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-xs transition-all cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <span className="block font-bold text-stone-900">Neha Patel</span>
                  <span className="text-[10px] text-stone-500">Active Manager (SBR0005)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-900 transition-all" />
              </button>

              <button 
                onClick={() => selectQuickAgent('SBR0006')}
                className="p-3 text-left bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-xs transition-all cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <span className="block font-bold text-stone-900">Deepak Rao</span>
                  <span className="text-[10px] text-stone-500">Channel Partner (SBR0006)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-900 transition-all" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Simple Clean Login Card */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-stone-200 shadow-md rounded-2xl p-6 sm:p-8 space-y-6">
            
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-stone-900 font-serif">Security Gateway</h2>
              <p className="text-stone-500 text-xs mt-0.5">
                Please enter your access key or select an identity.
              </p>
            </div>

            {/* Role Select Buttons */}
            <div className="grid grid-cols-2 gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => handleRoleChange('ADMIN')}
                className={`py-2 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRole === 'ADMIN' 
                    ? 'bg-emerald-800 text-white shadow-xs' 
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('AGENT')}
                className={`py-2 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRole === 'AGENT' 
                    ? 'bg-emerald-800 text-white shadow-xs' 
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                💼 Channel Partner
              </button>
            </div>

            {/* Actual Form */}
            <form onSubmit={handleFormLogin} className="space-y-4">
              
              {selectedRole !== 'AGENT' ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block font-sans">
                    Corporate Email Address
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="admin@propspire.in"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-800/10 focus:border-emerald-800 text-stone-900 outline-none"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block font-sans">
                    Channel Partner Sponsor ID
                  </label>
                  <input
                    type="text"
                    value={agentIdInput}
                    onChange={(e) => setAgentIdInput(e.target.value)}
                    placeholder="e.g. SBR0005"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-800/10 focus:border-emerald-800 text-stone-900 font-mono uppercase font-bold outline-none"
                    required
                  />
                  <span className="text-[9.5px] text-stone-500 block leading-relaxed">
                    Sponsor ID uniquely maps direct & downline Channel Partner network positions.
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block font-sans">
                    Security Passcode
                  </label>
                  {selectedRole === 'AGENT' && (
                    <span className="text-[9.5px] text-stone-500 font-mono">default: password</span>
                  )}
                  {selectedRole === 'ADMIN' && (
                    <span className="text-[9.5px] text-stone-500 font-mono">default: admin123</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
          <p>© 2026 SBR Associates. CRM Sourcing Operations. All rights reserved.</p>
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
