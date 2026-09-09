import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Check } from 'lucide-react';

interface CaptchaProps {
  onValidate: (isValid: boolean) => void;
}

export const Captcha: React.FC<CaptchaProps> = ({ onValidate }) => {
  const [num1, setNum1] = useState(3);
  const [num2, setNum2] = useState(4);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const generatePuzzle = () => {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 1;
    setNum1(a);
    setNum2(b);
    setUserAnswer('');
    setIsVerified(false);
    onValidate(false);
  };

  useEffect(() => {
    generatePuzzle();
  }, []);

  const handleAnswerChange = (val: string) => {
    setUserAnswer(val);
    if (parseInt(val.trim(), 10) === num1 + num2) {
      setIsVerified(true);
      onValidate(true);
    } else {
      setIsVerified(false);
      onValidate(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 rounded-xl bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/40 dark:border-white/10 transition-all">
      <div className="flex items-center gap-2 mb-3 text-text-secondary dark:text-slate-300 text-xs font-semibold uppercase tracking-wider">
        <ShieldCheck size={16} className="text-primary" />
        <span>Human Verification (Security Check)</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="px-3.5 py-1.5 rounded-lg bg-surface dark:bg-slate-900 border border-outline-variant font-mono font-bold text-base text-on-surface shadow-sm">
          {num1} + {num2} = ?
        </span>
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          placeholder="Answer"
          className="w-24 px-3 py-1.5 rounded-lg bg-surface dark:bg-slate-900 border border-outline-variant text-center font-mono font-bold text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
        />
        <button
          type="button"
          onClick={generatePuzzle}
          className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-variant/30 transition-colors"
          title="New puzzle"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {isVerified ? (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
          <Check size={14} /> Verification Passed! You can send your message now.
        </div>
      ) : (
        <span className="text-[11px] text-text-secondary dark:text-slate-400 mt-2">
          Solve the quick math puzzle to unlock the Send button.
        </span>
      )}
    </div>
  );
};
