import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Save, AlertCircle, Sparkles, Github, Mail } from 'lucide-react';
import { getApiKey, saveApiKey, removeApiKey } from '../../utils/aiService';
import { getGithubToken, saveGithubToken, removeGithubToken } from '../../utils/githubService';
import { compileAndSyncToGist } from '../../utils/syncService';
import { showAlert } from '../stores/useDialogStore';
import { getEmailJSKeys, saveEmailJSKeys } from '../../utils/emailjsService';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  
  const [emailServiceId, setEmailServiceId] = useState('');
  const [emailTemplateId, setEmailTemplateId] = useState('');
  const [emailPublicKey, setEmailPublicKey] = useState('');

  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getApiKey());
      setGithubToken(getGithubToken());
      
      const emailKeys = getEmailJSKeys();
      setEmailServiceId(emailKeys.serviceId);
      setEmailTemplateId(emailKeys.templateId);
      setEmailPublicKey(emailKeys.publicKey);
      
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim());
    } else {
      removeApiKey();
    }

    if (githubToken.trim()) {
      saveGithubToken(githubToken.trim());
    } else {
      removeGithubToken();
    }

    saveEmailJSKeys(emailServiceId.trim(), emailTemplateId.trim(), emailPublicKey.trim());

    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleManualSync = async () => {
    if (!githubToken.trim() && !getGithubToken()) {
      showAlert("Error", "Please save a GitHub token first.", "danger");
      return;
    }
    setIsSyncing(true);
    try {
      await compileAndSyncToGist();
      showAlert("Success", "Successfully synced all data to GitHub Gist!", "success");
    } catch (err: any) {
      console.error("Sync error:", err);
      showAlert("Sync Failed", "Failed to sync: " + err.message, "danger");
    } finally {
      setIsSyncing(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-surface rounded-3xl p-6 md:p-8 shadow-2xl border border-outline-variant overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-3xl rounded-full pointer-events-none" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mb-4">
                <Key size={24} />
              </div>
              <h2 className="text-xl font-bold text-on-surface">AI & API Settings</h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Enter your Google Gemini API Key for AI features, and a GitHub Token for importing repos & syncing data to Gist.
              </p>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Gemini Section */}
              <div className="bg-slate-50 dark:bg-slate-800/30 border border-outline-variant rounded-2xl p-5 hover:border-purple-500/50 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">Gemini API Key</h3>
                    <p className="text-xs text-on-surface-variant">Required for AI chat & content generation</p>
                  </div>
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-outline-variant text-on-surface focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                />
              </div>

              {/* GitHub Section */}
              <div className="bg-slate-50 dark:bg-slate-800/30 border border-outline-variant rounded-2xl p-5 hover:border-slate-500/50 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                    <Github size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">GitHub Personal Access Token</h3>
                    <p className="text-xs text-on-surface-variant">Requires 'gist' scope for data syncing</p>
                  </div>
                </div>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_..."
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-outline-variant text-on-surface focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                />
              </div>

              {/* EmailJS Section */}
              <div className="bg-slate-50 dark:bg-slate-800/30 border border-outline-variant rounded-2xl p-5 hover:border-brand/50 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">EmailJS Configuration</h3>
                    <p className="text-xs text-on-surface-variant">Required for Newsletter Broadcasts</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant block mb-1.5 uppercase tracking-wider">Service ID</label>
                    <input
                      type="text"
                      value={emailServiceId}
                      onChange={(e) => setEmailServiceId(e.target.value)}
                      placeholder="service_..."
                      className="w-full px-3 py-2.5 text-sm rounded-lg bg-white dark:bg-slate-900 border border-outline-variant text-on-surface focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant block mb-1.5 uppercase tracking-wider">Template ID</label>
                    <input
                      type="text"
                      value={emailTemplateId}
                      onChange={(e) => setEmailTemplateId(e.target.value)}
                      placeholder="template_..."
                      className="w-full px-3 py-2.5 text-sm rounded-lg bg-white dark:bg-slate-900 border border-outline-variant text-on-surface focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant block mb-1.5 uppercase tracking-wider">Public Key</label>
                    <input
                      type="text"
                      value={emailPublicKey}
                      onChange={(e) => setEmailPublicKey(e.target.value)}
                      placeholder="public_..."
                      className="w-full px-3 py-2.5 text-sm rounded-lg bg-white dark:bg-slate-900 border border-outline-variant text-on-surface focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-4 rounded-xl text-xs gap-3 items-start">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="leading-relaxed">Your API keys are stored securely in your browser's local storage and are never sent to our servers. They are only used directly from your browser.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-outline-variant">
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  {isSaved ? 'Saved Successfully!' : 'Save All Keys'}
                  {!isSaved && <Save size={18} />}
                </button>

                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-brand/20"
                >
                  {isSyncing ? 'Syncing Data...' : 'Force Sync to Gist'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
