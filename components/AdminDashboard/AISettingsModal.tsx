import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Save, AlertCircle } from 'lucide-react';
import { getApiKey, saveApiKey, removeApiKey } from '../../utils/aiService';
import { getGithubToken, saveGithubToken, removeGithubToken } from '../../utils/githubService';
import { compileAndSyncToGist } from '../../utils/syncService';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getApiKey());
      setGithubToken(getGithubToken());
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

    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleManualSync = async () => {
    if (!githubToken.trim() && !getGithubToken()) {
      alert("Please save a GitHub token first.");
      return;
    }
    setIsSyncing(true);
    try {
      await compileAndSyncToGist();
      alert("Successfully synced all data to GitHub Gist!");
    } catch (err: any) {
      alert("Failed to sync: " + err.message);
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

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-on-surface-variant block mb-2">Gemini API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-outline-variant text-on-surface focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-on-surface-variant block mb-2">GitHub Personal Access Token (Requires 'gist' scope)</label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-outline-variant text-on-surface focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="flex bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-xl text-xs gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>Your API key is stored securely in your browser's local storage and is never sent to our servers.</p>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isSaved ? 'Saved!' : 'Save Keys'}
                  {!isSaved && <Save size={18} />}
                </button>

                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSyncing ? 'Syncing...' : 'Force Sync to Gist'}
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
