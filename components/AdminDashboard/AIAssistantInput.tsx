import React, { useState } from 'react';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { getAIAutocomplete, getAIBlogGeneration } from '../../utils/aiService';
import { motion, AnimatePresence } from 'framer-motion';

interface AIAssistantInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fieldType?: string; // 'Project Description', 'Blog Content', etc.
  type?: 'textarea' | 'text' | 'richtext';
  rows?: number;
  className?: string;
  isBlogGenerator?: boolean;
}

export const AIAssistantInput: React.FC<AIAssistantInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  fieldType = 'Text',
  type = 'textarea',
  rows = 4,
  className = '',
  isBlogGenerator = false
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const handleGenerate = async (action: 'autocomplete' | 'generate') => {
    setIsGenerating(true);
    setError('');
    setShowMenu(false);

    try {
      if (action === 'autocomplete') {
        const completion = await getAIAutocomplete(value, fieldType);
        // append completion if value doesn't end with space
        const space = value.length > 0 && !value.endsWith(' ') && !value.endsWith('\n') ? ' ' : '';
        onChange(value + space + completion);
      } else if (action === 'generate') {
        if (!value.trim()) {
          throw new Error('Please enter a topic first');
        }
        const generated = await getAIBlogGeneration(value);
        onChange(generated);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate text');
      // Hide error after 5s
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`space-y-2 relative ${className}`}>
      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">{label}</label>
      
      <div className={`relative group ${isGenerating ? 'ring-2 ring-brand ring-offset-2 dark:ring-offset-slate-900 transition-all rounded-xl' : ''}`}>
        {type === 'richtext' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Write your content here (supports markdown/HTML)...'}
            rows={12}
            className="w-full px-5 py-4 rounded-2xl bg-surface text-on-surface border border-outline-variant focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all pr-12 resize-y min-h-[300px] leading-relaxed shadow-sm font-medium"
          />
        ) : type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all pr-12 resize-y"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-outline-variant focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all pr-12 shadow-sm text-on-surface"
          />
        )}

        {/* AI Action Button */}
        <div className={`absolute right-2 flex flex-col items-end ${type === 'richtext' ? 'top-14 right-4' : 'top-2'}`}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            disabled={isGenerating}
            className={`p-2 rounded-lg bg-gradient-to-br from-brand/10 to-purple-500/10 text-brand hover:from-brand hover:to-purple-600 hover:text-white transition-all shadow-sm flex items-center justify-center ${isGenerating ? 'animate-pulse' : ''}`}
            title="Ask AI"
          >
            {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
          </button>

          {/* AI Menu */}
          <AnimatePresence>
            {showMenu && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                className="absolute top-12 right-0 w-48 bg-surface rounded-xl shadow-xl border border-outline-variant z-50 overflow-hidden"
              >
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => handleGenerate('autocomplete')}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <Wand2 size={16} className="text-brand" />
                    Auto Complete
                  </button>
                  {isBlogGenerator && (
                    <button
                      type="button"
                      onClick={() => handleGenerate('generate')}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left border-t border-slate-100 dark:border-slate-700"
                    >
                      <Sparkles size={16} className="text-purple-500" />
                      Generate from Topic
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-8 right-0 z-50 text-xs text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/20 whitespace-nowrap"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Click outside listener overlay for menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};
