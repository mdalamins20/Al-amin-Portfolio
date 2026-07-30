import React from 'react';
import { Link } from 'react-router-dom';
import { useProfileStore } from './stores/useProfileStore';
import { getIconByName } from './IconMapper';

export const Footer: React.FC = () => {
  const { profile, loading } = useProfileStore();

  if (loading || !profile) return null;

  return (
    <footer className="relative w-full py-10 md:py-16 bg-surface border-t border-surface-variant/10">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-stack-lg">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Al-amin.</h2>
            <p className="text-text-secondary font-body-md max-w-sm">
              I help startups and businesses build fast, modern, conversion-focused websites that scale effortlessly. Available for freelance and full-time opportunities.
            </p>
            <div className="flex gap-4 flex-wrap">
              {(profile.socialLinks || []).map((link, index) => {
                return (
                  <a 
                    key={index}
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:text-primary transition-colors"
                    title={link.name}
                  >
                    {getIconByName(link.iconName, 20)}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Sitemap */}
          <div>
            <h4 className="font-label-bold text-label-bold text-on-surface uppercase mb-6 tracking-widest">Sitemap</h4>
            <ul className="space-y-3">
              <li><Link to="/#why-me" className="text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group text-sm font-medium"><span className="material-symbols-outlined text-[16px] text-surface-variant group-hover:text-primary transition-colors">arrow_right</span>Why Me</Link></li>
              <li><Link to="/#services" className="text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group text-sm font-medium"><span className="material-symbols-outlined text-[16px] text-surface-variant group-hover:text-primary transition-colors">arrow_right</span>Services</Link></li>
              <li><Link to="/#work" className="text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group text-sm font-medium"><span className="material-symbols-outlined text-[16px] text-surface-variant group-hover:text-primary transition-colors">arrow_right</span>Work</Link></li>
              <li><Link to="/#testimonials" className="text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group text-sm font-medium"><span className="material-symbols-outlined text-[16px] text-surface-variant group-hover:text-primary transition-colors">arrow_right</span>Reviews</Link></li>
              <li><Link to="/blog" className="text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group text-sm font-medium"><span className="material-symbols-outlined text-[16px] text-surface-variant group-hover:text-primary transition-colors">arrow_right</span>Blog</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-label-bold text-label-bold text-on-surface uppercase mb-6 tracking-widest">Contact</h4>
            <ul className="space-y-5 list-none">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary uppercase tracking-widest mb-1 font-bold">Email</p>
                  <a href={`mailto:${profile.email}`} className="text-on-surface hover:text-primary transition-colors block break-all font-medium text-sm">
                    {profile.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary uppercase tracking-widest mb-1 font-bold">Phone</p>
                  <a href={`tel:${profile.phone}`} className="text-on-surface hover:text-secondary transition-colors block break-words font-medium text-sm">
                    {profile.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary uppercase tracking-widest mb-1 font-bold">Location</p>
                  <span className="text-on-surface block break-words font-medium text-sm">
                    {profile.locationText || "Dhaka, Bangladesh"}
                  </span>
                </div>
              </li>
            </ul>
            <div className="mt-8 flex items-center flex-wrap gap-4">

              {profile.cvFileUrl && (
                <a 
                  href={profile.cvFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-on-surface font-label-bold hover:text-primary transition-colors uppercase tracking-widest text-xs flex items-center gap-1 group"
                >
                  View CV <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-surface-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <p className="text-text-secondary text-sm font-medium">
            © {new Date().getFullYear()} <span className="text-on-surface font-bold">Muhammad Al-amin</span>. All Rights Reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
              className="flex items-center gap-1.5 text-text-secondary hover:text-primary transition-colors text-sm font-medium group"
            >
              Back To Top 
              <span className="material-symbols-outlined text-[16px] group-hover:-translate-y-1 transition-transform">arrow_upward</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
