import React from 'react';
import { Link } from 'react-router-dom';
import { useProfileStore } from './stores/useProfileStore';
import { getIconByName } from './IconMapper';
import { Mail, Phone, MapPin, ArrowUp, ArrowRight, Download } from 'lucide-react';

export const Footer: React.FC = () => {
  const { profile, loading } = useProfileStore();

  if (loading || !profile) return null;

  return (
    <footer className="relative w-full pt-12 pb-10 bg-surface/70 dark:bg-slate-950/80 backdrop-blur-2xl border-t border-surface-variant/25 dark:border-white/10">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12">
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 space-y-5">
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center gap-2.5 group">
              <img 
                src={profile?.favicon || "https://i.ibb.co.com/4ZtpFT0b/IMG.png"} 
                alt={profile?.name || "Muhammad Al-amin"} 
                className="w-9 h-9 rounded-full object-cover shadow-sm ring-1 ring-surface-variant/40 dark:ring-white/15 group-hover:scale-105 transition-transform"
              />
              <span className="font-headline-md text-xl md:text-2xl font-bold tracking-tight text-on-surface group-hover:text-primary transition-colors">
                Al-amin<span className="text-primary font-black">.</span>
              </span>
            </Link>
            
            <p className="text-text-secondary dark:text-slate-300 font-normal text-sm md:text-[15px] leading-relaxed max-w-sm">
              I help startups and businesses build fast, modern, conversion-focused web solutions that scale effortlessly.
            </p>
            
            {/* Social Links as subtle glass circles */}
            <div className="flex gap-2.5 flex-wrap pt-1">
              {(profile.socialLinks || []).map((link, index) => {
                return (
                  <a 
                    key={index}
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-9 h-9 rounded-full bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 flex items-center justify-center text-on-surface hover:text-primary hover:border-primary/40 hover:scale-105 active:scale-95 transition-all shadow-sm"
                    title={link.name}
                  >
                    {getIconByName(link.iconName, 16)}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Navigation (3 cols) */}
          <div className="md:col-span-3">
            <h4 className="font-label-bold text-xs uppercase tracking-widest text-text-secondary dark:text-slate-400 mb-5 font-extrabold">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Selected Works', href: '/#work' },
                { label: 'Technical Arsenal', href: '/#expertise' },
                { label: 'Career Journey', href: '/#experience' },
                { label: 'Client Reviews', href: '/#testimonials' },
                { label: 'Engineering Blog', href: '/blog' },
                { label: 'Get In Touch', href: '/#contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.href} 
                    className="text-text-secondary dark:text-slate-300 hover:text-primary transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-medium group"
                  >
                    <ArrowRight size={13} className="text-surface-variant dark:text-slate-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-label-bold text-xs uppercase tracking-widest text-text-secondary dark:text-slate-400 mb-5 font-extrabold">Direct Contact</h4>
            
            <a 
              href={`mailto:${profile.email}`} 
              className="flex items-center gap-3 p-3 rounded-2xl bg-surface-variant/15 dark:bg-white/5 border border-surface-variant/20 dark:border-white/5 hover:border-primary/40 hover:bg-surface-variant/25 transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                <Mail size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-text-secondary dark:text-slate-400 uppercase font-bold tracking-wider">Email</p>
                <p className="text-xs sm:text-sm text-on-surface font-semibold truncate group-hover:text-primary transition-colors">{profile.email}</p>
              </div>
            </a>

            <a 
              href={`tel:${profile.phone}`} 
              className="flex items-center gap-3 p-3 rounded-2xl bg-surface-variant/15 dark:bg-white/5 border border-surface-variant/20 dark:border-white/5 hover:border-primary/40 hover:bg-surface-variant/25 transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
                <Phone size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-text-secondary dark:text-slate-400 uppercase font-bold tracking-wider">Direct Line</p>
                <p className="text-xs sm:text-sm text-on-surface font-semibold truncate group-hover:text-emerald-500 transition-colors">{profile.phone}</p>
              </div>
            </a>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-variant/15 dark:bg-white/5 border border-surface-variant/20 dark:border-white/5">
              <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <MapPin size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-text-secondary dark:text-slate-400 uppercase font-bold tracking-wider">Location</p>
                <p className="text-xs sm:text-sm text-on-surface font-semibold truncate">{profile.locationText || "Barishal & Dhaka, Bangladesh"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Unified Alignment */}
        <div className="pt-6 border-t border-surface-variant/15 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3.5">
          <p className="text-text-secondary dark:text-slate-400 text-xs sm:text-sm font-normal text-center sm:text-left">
            © {new Date().getFullYear()} <span className="text-on-surface font-bold">Muhammad Al-amin</span>. Crafted with precision &amp; performance.
          </p>
          
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-variant/20 dark:bg-white/5 hover:bg-primary/10 border border-surface-variant/20 dark:border-white/10 text-xs text-text-secondary hover:text-primary transition-all group active:scale-95"
          >
            <span>Back to top</span>
            <ArrowUp size={13} className="group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
};
