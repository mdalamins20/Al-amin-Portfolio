import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import * as OTPAuth from 'otpauth';
import { QRCodeCanvas } from 'qrcode.react';
import { ShieldCheck, ShieldAlert, KeyRound, Copy, Check, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TwoFactorSetup: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [secret, setSecret] = useState('');
  const [totpUri, setTotpUri] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check2FAStatus = async () => {
      try {
        const docRef = doc(db, 'settings', 'security');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().is2FAEnabled) {
          setIsEnabled(true);
        } else {
          setIsEnabled(false);
        }
      } catch (e) {
        console.error("Failed to check 2FA status", e);
      } finally {
        setLoading(false);
      }
    };
    check2FAStatus();
  }, []);

  const handleStartSetup = () => {
    // Generate new secret
    const newSecret = new OTPAuth.Secret({ size: 20 });
    setSecret(newSecret.base32);
    
    // Create TOTP instance
    const totp = new OTPAuth.TOTP({
      issuer: 'Admin Portfolio',
      label: 'Admin',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: newSecret
    });
    
    setTotpUri(totp.toString());
    setIsSettingUp(true);
    setError('');
    setVerificationCode('');
  };

  const handleVerifySetup = async () => {
    setError('');
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    try {
      const totp = new OTPAuth.TOTP({
        issuer: 'Admin Portfolio',
        label: 'Admin',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret)
      });

      const delta = totp.validate({ token: verificationCode, window: 1 });

      if (delta === null) {
        setError('Invalid code. Please try again.');
        return;
      }

      // Save to Firestore
      await setDoc(doc(db, 'settings', 'security'), {
        is2FAEnabled: true,
        totpSecret: secret,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setIsEnabled(true);
      setIsSettingUp(false);
    } catch (e) {
      console.error("Failed to verify/save 2FA", e);
      setError('An error occurred during setup. Please try again.');
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm("Are you sure you want to disable 2FA? This will make your account less secure.")) return;
    try {
      setLoading(true);
      await setDoc(doc(db, 'settings', 'security'), {
        is2FAEnabled: false,
        totpSecret: null,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setIsEnabled(false);
    } catch (e) {
      console.error("Failed to disable 2FA", e);
      setError("Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-3xl border border-outline-variant p-8 animate-pulse flex justify-center mt-8">
        <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-3xl border border-outline-variant shadow-lg overflow-hidden mt-8">
      <div className="p-6 border-b border-outline-variant bg-surface-variant/30 flex justify-between items-center">
        <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
          {isEnabled ? <ShieldCheck className="text-green-500" size={24} /> : <ShieldAlert className="text-amber-500" size={24} />}
          Two-Factor Authentication (2FA)
        </h3>
        {isEnabled && (
          <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Enabled
          </span>
        )}
      </div>

      <div className="p-6">
        {!isEnabled && !isSettingUp && (
          <div className="flex flex-col items-start gap-4">
            <p className="text-on-surface-variant">
              Enhance your account security by requiring a 6-digit code from Google Authenticator every time you log in.
            </p>
            <button
              onClick={handleStartSetup}
              className="px-6 py-2.5 bg-brand text-white rounded-xl font-bold transition-all hover:bg-brand/90 hover:scale-[1.02] active:scale-95 flex items-center gap-2 shadow-lg shadow-brand/20"
            >
              <QrCode size={18} />
              Enable 2FA
            </button>
          </div>
        )}

        {isEnabled && !isSettingUp && (
          <div className="flex flex-col items-start gap-4">
            <p className="text-on-surface-variant">
              Two-Factor Authentication is currently active on your account. You will be prompted for a code from Google Authenticator during login.
            </p>
            <button
              onClick={handleDisable2FA}
              className="px-6 py-2.5 bg-red-500/10 text-red-500 rounded-xl font-bold transition-all hover:bg-red-500 hover:text-white active:scale-95 flex items-center gap-2"
            >
              Disable 2FA
            </button>
          </div>
        )}

        <AnimatePresence>
          {isSettingUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 overflow-hidden"
            >
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-2xl text-sm font-medium mt-4">
                Important: Do not close this window until you have successfully verified the code. If you lose this QR code before verifying, you won't be able to log in.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <div>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand/10 text-brand font-bold text-sm mb-3">1</span>
                    <h4 className="font-bold text-on-surface text-lg">Scan QR Code</h4>
                    <p className="text-sm text-on-surface-variant">Open Google Authenticator and scan this QR code.</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-2xl inline-block border border-outline-variant">
                    <QRCodeCanvas value={totpUri} size={160} fgColor="#000000" bgColor="#ffffff" />
                  </div>
                  
                  <div>
                    <p className="text-xs text-on-surface-variant mb-2">Can't scan the QR code? Enter this secret manually:</p>
                    <div className="flex items-center gap-2">
                      <code className="px-3 py-1.5 bg-surface-variant rounded-lg font-mono text-sm border border-outline-variant select-all">
                        {secret}
                      </code>
                      <button
                        onClick={copySecret}
                        className="p-1.5 hover:bg-surface-variant rounded-lg transition-colors text-on-surface-variant"
                        title="Copy Secret"
                      >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand/10 text-brand font-bold text-sm mb-3">2</span>
                    <h4 className="font-bold text-on-surface text-lg">Verify Code</h4>
                    <p className="text-sm text-on-surface-variant">Enter the 6-digit code generated by your app.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="w-full bg-surface border-2 border-outline-variant rounded-2xl py-3 pl-12 pr-4 text-on-surface font-mono text-xl tracking-[0.2em] placeholder:tracking-normal focus:border-brand focus:ring-4 focus:ring-brand/20 transition-all outline-none"
                        maxLength={6}
                      />
                    </div>
                    {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                    <button
                      onClick={handleVerifySetup}
                      disabled={verificationCode.length !== 6}
                      className="w-full py-3 bg-brand text-white rounded-2xl font-bold hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify and Enable
                    </button>
                    <button
                      onClick={() => setIsSettingUp(false)}
                      className="w-full py-3 text-on-surface-variant font-medium hover:text-on-surface transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
