import React from 'react';
import { Navigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Settings, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, isConfigured } from '../firebase';
import { useAuthStore } from './stores/useAuthStore';
import { useAdminLogin } from './hooks/useAdminLogin';

export const AdminLogin: React.FC = () => {
  const { user, loading: authLoading } = useAuthStore();
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
      <div className="min-h-screen flex items-center justify-center bg-theme-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (user && localStorage.getItem('adminSessionId')) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-theme-card border border-theme-border rounded-2xl p-8 shadow-xl overflow-hidden relative"
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10 text-brand mb-4">
                  <Lock size={32} />
                </div>
                <h1 className="text-2xl font-bold text-theme-text">Admin Login</h1>
                <p className="text-theme-dim mt-2">Access your portfolio dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {!isConfigured && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex flex-col gap-2 text-amber-600 text-sm">
                    <div className="flex items-center gap-2 font-bold">
                      <Settings size={18} />
                      <span>Configuration Required</span>
                    </div>
                    <p>Please set your Firebase environment variables to enable the Admin Panel.</p>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500 text-sm">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-theme-text">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-dim" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-base pl-10 pr-4 py-3 bg-theme-bg border border-theme-border rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all text-theme-text"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-theme-text">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-dim" size={18} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-base pl-10 pr-4 py-3 bg-theme-bg border border-theme-border rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all text-theme-text"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand hover:bg-brand-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10 text-brand mb-4">
                  <KeyRound size={32} />
                </div>
                <h1 className="text-2xl font-bold text-theme-text">2-Step Verification</h1>
                <p className="text-theme-dim mt-2">Enter the code from Google Authenticator</p>
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500 text-sm">
                    <AlertCircle size={18} />
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
                      className="w-full text-center py-4 bg-theme-bg border-2 border-theme-border rounded-xl focus:ring-4 focus:ring-brand/20 focus:border-brand outline-none transition-all text-theme-text font-mono text-3xl tracking-[0.3em]"
                      placeholder="000000"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || totpCode.length !== 6}
                  className="w-full bg-brand hover:bg-brand-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
