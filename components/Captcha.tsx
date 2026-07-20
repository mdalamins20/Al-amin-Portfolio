import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  onValidate: (isValid: boolean) => void;
}

export const Captcha: React.FC<CaptchaProps> = ({ onValidate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');

  const generateCaptchaText = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let text = '';
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
  };

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background color
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise (lines)
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Add noise (dots)
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw text with random rotation and position
    ctx.font = 'bold 24px monospace';
    ctx.textBaseline = 'middle';
    
    let xOffset = 20;
    for (let i = 0; i < text.length; i++) {
      ctx.save();
      // Random color
      ctx.fillStyle = `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)})`;
      
      // Random rotation between -20 and 20 degrees
      const angle = (Math.random() * 0.4 - 0.2);
      
      ctx.translate(xOffset, canvas.height / 2 + (Math.random() * 10 - 5));
      ctx.rotate(angle);
      
      ctx.fillText(text[i], 0, 0);
      
      ctx.restore();
      xOffset += 22;
    }
  };

  const refreshCaptcha = () => {
    const newText = generateCaptchaText();
    setCaptchaText(newText);
    drawCaptcha(newText);
    setUserInput('');
    onValidate(false);
  };

  useEffect(() => {
    refreshCaptcha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);
    onValidate(val.toLowerCase() === captchaText.toLowerCase());
  };

  return (
    <div className="flex flex-col items-center space-y-3 pt-4">
      <label className="block text-xs font-label-bold text-text-secondary uppercase tracking-widest text-center">
        Human Verification
      </label>
      <div className="flex items-center gap-3">
        <canvas 
          ref={canvasRef} 
          width={160} 
          height={50} 
          className="rounded-lg shadow-sm border border-outline-variant/30 dark:opacity-80"
        />
        <button 
          type="button" 
          onClick={refreshCaptcha}
          className="p-2.5 rounded-xl bg-surface-variant text-text-secondary hover:text-primary transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
          title="Refresh Captcha"
        >
          <RefreshCw size={20} />
        </button>
      </div>
      <input 
        type="text" 
        value={userInput}
        onChange={handleInputChange}
        required
        maxLength={6}
        className="w-full md:w-2/3 mx-auto block px-5 py-3.5 bg-surface/50 dark:bg-surface-deep/30 backdrop-blur-sm border border-outline-variant/50 rounded-xl focus:bg-surface dark:focus:bg-surface-deep focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm font-bold text-center tracking-widest uppercase"
        placeholder="Type characters above"
      />
    </div>
  );
};
