import React from 'react';
import { Navigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Settings, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, isConfigured } from '../firebase';
import { useAuthStore } from './stores/useAuthStore';
import { useAdminLogin } from './hooks/useAdminLogin';

export const AdminLogin: React.FC = () => {
  const { user, loading: authLoading, init } = useAuthStore();
  
  React.useEffect(() => {
    init();
  }, [init]);

  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleLogin,
    requires2FA,
    totpCode,
    setTotpCode,
    handleVerify2FA
  } = useAdminLogin();

  // Temporarily removed aggressive signOut effect to prevent login loops

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user && localStorage.getItem('adminSessionId')) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px] -z-10 opacity-70 pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px] -z-10 opacity-60 pointer-events-none mix-blend-screen" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface/90 dark:bg-slate-950/80 backdrop-blur-2xl border border-surface-variant/30 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden relative"
      >
        <AnimatePresence mode="wait">
          {!requires2FA ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 border border-primary/20 shadow-inner">
                  <Lock size={30} />
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight">Admin Login</h1>
                <p className="text-text-secondary text-sm mt-1.5 font-medium">Access your portfolio control panel</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {!isConfigured && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex flex-col gap-2 text-amber-600 dark:text-amber-400 text-sm">
                    <div className="flex items-center gap-2 font-bold">
                      <Settings size={18} />
                      <span>Configuration Required</span>
                    </div>
                    <p className="text-xs">Please set your Firebase environment variables to enable the Admin Panel.</p>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-medium">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-base pl-12 pr-4 py-3.5 bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/25 focus:border-primary outline-none transition-all text-on-surface font-medium"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-base pl-12 pr-4 py-3.5 bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/25 focus:border-primary outline-none transition-all text-on-surface font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="2fa"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 border border-primary/20 shadow-inner">
                  <KeyRound size={30} />
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight">2-Step Verification</h1>
                <p className="text-text-secondary text-sm mt-1.5 font-medium">Enter the 6-digit code from your authenticator app</p>
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-medium">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoFocus
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full text-center py-4 bg-surface-variant/20 dark:bg-white/5 border-2 border-surface-variant/30 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface font-mono text-3xl tracking-[0.3em] font-bold"
                      placeholder="000000"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || totpCode.length !== 6}
                  className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    'Verify Code'
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
