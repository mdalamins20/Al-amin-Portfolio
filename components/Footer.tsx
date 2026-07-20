import React from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from './ProfileContext';
import { getIconByName } from './IconMapper';

export const Footer: React.FC = () => {
  const { profile, loading } = useProfile();

  if (loading || !profile) return null;

  return (
    <footer className="relative w-full py-section-padding bg-surface border-t border-surface-variant/10">
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
            <ul className="space-y-4">
              <li><Link to="/#why-me" className="text-text-secondary hover:text-primary transition-colors">Why Me</Link></li>
              <li><Link to="/#services" className="text-text-secondary hover:text-primary transition-colors">Services</Link></li>
              <li><Link to="/#work" className="text-text-secondary hover:text-primary transition-colors">Work</Link></li>
              <li><Link to="/#testimonials" className="text-text-secondary hover:text-primary transition-colors">Reviews</Link></li>
              <li><Link to="/blog" className="text-text-secondary hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-label-bold text-label-bold text-on-surface uppercase mb-6 tracking-widest">Contact</h4>
            <ul className="space-y-4 list-none">
              <li className="flex items-center gap-2 text-text-secondary">
                <span className="material-symbols-outlined text-sm">mail</span>
                {profile.email}
              </li>
              <li className="flex items-center gap-2 text-text-secondary">
                <span className="material-symbols-outlined text-sm">call</span>
                {profile.phone}
              </li>
              <li className="flex items-center gap-2 text-text-secondary">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {profile.locationText || "Dhaka, Bangladesh"}
              </li>
              <li className="pt-4">
                 <span className="bg-primary-container/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Available for Remote</span>
              </li>
            </ul>
            <div className="mt-8">
              <button className="text-primary font-label-bold border-b border-primary hover:text-on-primary-container transition-colors uppercase tracking-widest">View CV</button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-surface-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-secondary text-sm">© {new Date().getFullYear()} Muhammad Al-amin. All Rights Reserved.</p>
          
          <div className="flex gap-8">
            <Link to="#" className="text-text-secondary hover:text-on-surface text-sm">Privacy Policy</Link>
            <Link to="#" className="text-text-secondary hover:text-on-surface text-sm">Terms of Service</Link>
            <Link to="/admin-login" className="text-text-secondary hover:text-on-surface text-sm">Admin Panel</Link>
          </div>
          
          <button 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors uppercase font-label-bold tracking-widest text-xs"
          >
            Back To Top <span className="material-symbols-outlined text-sm">arrow_upward</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
