import { useDemo } from '@/context/DemoContext'
import { useIsMobile } from '@/hooks/useIsMobile'
import { PhoneFrame } from '@/mobile/layout/PhoneFrame'
import { MobileLoginPage } from '@/mobile/pages/MobileLoginPage'
import { DemoSwitcher } from '@/components/common/DemoSwitcher'
import {
  ArrowRight,
  CheckCircle2,
  Fingerprint,
  KeyRound,
  Layers,
  Lock,
  Mail,
  Shield,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { setRole, setEmployeeType } = useDemo()
  const { isMobile, isPhonePreview } = useIsMobile()

  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password')
  const [empId, setEmpId] = useState('EMP-003')
  const [password, setPassword] = useState('demo1234')
  const [otp, setOtp] = useState('4829')

  if (isPhonePreview) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 overflow-auto">
        <PhoneFrame>
          <MobileLoginPage />
        </PhoneFrame>
        <DemoSwitcher />
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground antialiased">
        <MobileLoginPage />
        <DemoSwitcher />
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // UI-only demo login: accepts any value and goes to employee dashboard
    setRole('Employee')
    navigate('/employee/dashboard')
  }

  const handleQuickPersona = (role: 'Employee' | 'Manager' | 'HR Admin', profile: string) => {
    setRole(role)
    setEmployeeType(profile as any)
    if (role === 'HR Admin') {
      navigate('/hr/dashboard')
    } else if (role === 'Manager') {
      navigate('/manager/dashboard')
    } else {
      navigate('/employee/dashboard')
    }
  }

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Left Branding Showcase Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">
                Universal HRMS ERP
              </span>
              <span className="block text-[11px] text-indigo-300 font-mono">
                Workforce Operating System
              </span>
            </div>
          </div>

          <div className="mt-20 space-y-4 max-w-lg">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              One Unified HR Platform For Every Workforce Model.
            </h1>
            <p className="text-sm text-indigo-200/90 leading-relaxed">
              From corporate IT headquarters and hospital nursing shifts to field sales geo-tracking and manufacturing plant punch turnstiles.
            </p>
          </div>
        </div>

        {/* Feature Highlights on Hero */}
        <div className="relative z-10 grid grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <Fingerprint className="w-4 h-4 text-cyan-400 mb-2" />
            <h4 className="font-semibold">Adaptive Attendance</h4>
            <p className="text-[11px] text-indigo-200/70 mt-0.5">
              Geofence, selfie verification, and night shift tracking.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <Shield className="w-4 h-4 text-indigo-400 mb-2" />
            <h4 className="font-semibold">Precision Entitlement</h4>
            <p className="text-[11px] text-indigo-200/70 mt-0.5">
              Dynamic 6-tier ceiling & override access engine.
            </p>
          </div>
        </div>

        <div className="text-[11px] text-indigo-300/60 relative z-10">
          Universal ERP • Demo Simulation Mode
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <div className="lg:hidden flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-foreground">
                Universal HRMS
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Enter your Employee ID to access your Self-Service portal.
            </p>
          </div>

          {/* Auth Method Switch Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-muted/60 rounded-xl border border-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAuthMethod('password')}
              className={`py-2 rounded-lg transition ${
                authMethod === 'password'
                  ? 'bg-card text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('otp')}
              className={`py-2 rounded-lg transition ${
                authMethod === 'otp'
                  ? 'bg-card text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mobile / Email OTP
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-foreground block mb-1">
                Employee ID or Email Address
              </label>
              <input
                type="text"
                required
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="e.g. EMP-003 or your work email"
                className="w-full px-3 py-2.5 bg-background border border-input rounded-xl text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {authMethod === 'password' ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-foreground block">
                    Password
                  </label>
                  <a href="#demo" onClick={(e) => e.preventDefault()} className="text-[11px] text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-xl text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            ) : (
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  One-Time Password (OTP)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="4829"
                  className="w-full px-3 py-2.5 font-mono tracking-widest text-center text-sm bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 transition text-xs flex items-center justify-center gap-2"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Persona Shortcuts */}
          <div className="pt-4 border-t border-border space-y-2.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Quick One-Click Demo Personas:
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPersona('Employee', 'Office Staff')}
                className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-[11px] font-medium text-foreground text-center"
              >
                Aarav Patel
                <span className="block text-[10px] text-muted-foreground">Office Staff</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPersona('Employee', 'Factory Worker')}
                className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-[11px] font-medium text-foreground text-center"
              >
                Gopal Shinde
                <span className="block text-[10px] text-muted-foreground">Factory Worker</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPersona('Manager', 'Manager')}
                className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-[11px] font-medium text-foreground text-center"
              >
                Vikram M.
                <span className="block text-[10px] text-muted-foreground">Lead Manager</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
