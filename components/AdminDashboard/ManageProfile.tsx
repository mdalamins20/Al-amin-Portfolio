
import React, { useState, useEffect } from 'react';
import { useProfile } from '../ProfileContext';
import { Profile, SocialLink, Stat, Service, ProcessStep } from '../../types';
import { Save, Loader2, Plus, Trash2, Globe, User, BookOpen, Star, Layers, Zap, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getIconByName, ICON_NAMES } from '../IconMapper';
import { ImageUpload } from './ImageUpload';

export const ManageProfile: React.FC = () => {
  const { profile, loading, updateProfile } = useProfile();
  const [formData, setFormData] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'about' | 'social' | 'stats' | 'services' | 'process'>('basic');

  useEffect(() => {
    if (profile) {
      setFormData(JSON.parse(JSON.stringify(profile)));
    }
  }, [profile]);

  const handleSave = async () => {
    if (!formData) return;
    setSaving(true);
    try {
      await updateProfile(formData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-brand" size={48} />
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'about', label: 'About Me', icon: BookOpen },
    { id: 'social', label: 'Social Links', icon: Globe },
    { id: 'stats', label: 'Stats', icon: Star },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'process', label: 'Process', icon: Zap },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Manage Profile</h1>
          <p className="text-slate-500 dark:text-slate-400">Control your personal information and site content</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand hover:scale-[1.02] active:scale-[0.98] text-white px-8 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-50 min-w-[160px] shadow-lg shadow-brand/20"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save Changes
        </button>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-2 border-b border-slate-200 dark:border-white/10 hide-scrollbar mask-edges">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                  : 'bg-white dark:bg-transparent border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <Icon size={18} className={activeTab === tab.id ? 'text-brand dark:text-brand' : ''} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm overflow-hidden relative">
         {/* Subtle background glow */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-3xl rounded-full pointer-events-none" />

        <AnimatePresence mode="wait">
          {activeTab === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"
            >
              <div className="md:col-span-2 flex flex-col md:flex-row gap-8 items-start pb-8 border-b border-slate-100 dark:border-white/5">
                <div className="shrink-0 space-y-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">Profile Picture</h3>
                  <div className="w-40 sm:w-48">
                    <ImageUpload
                      label=""
                      initialValue={formData.image}
                      onUploadComplete={(url) => setFormData({ ...formData, image: url })}
                      folder="profile"
                      cropShape="round"
                      aspectRatio={1}
                    />
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-1 gap-6 w-full">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                    <input
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Role / Title</label>
                    <input
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-11 pr-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2 pt-4">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tagline (Hero Section)</label>
                <input
                  value={formData.tagline}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm font-medium text-lg"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Supporting Line (Hero Section)</label>
                <textarea
                  value={formData.supportingLine}
                  onChange={e => setFormData({ ...formData, supportingLine: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm min-h-[120px] resize-y"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 relative z-10"
            >
              <div className="space-y-2">
                <label className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User size={20} className="text-brand" />
                  About Me (Main Text)
                </label>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">This usually appears on the About page or section.</p>
                <textarea
                  value={formData.aboutMe}
                  onChange={e => setFormData({ ...formData, aboutMe: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm min-h-[200px] leading-relaxed resize-y"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-white/5">
                <div className="space-y-3 p-6 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                  <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center text-brand mb-4">
                    <User size={24} />
                  </div>
                  <label className="text-base font-bold text-slate-900 dark:text-white">Who I Help</label>
                  <textarea
                    value={formData.whoIHelp}
                    onChange={e => setFormData({ ...formData, whoIHelp: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white min-h-[120px] text-sm resize-none"
                    placeholder="Describe your target audience..."
                  />
                </div>
                <div className="space-y-3 p-6 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                   <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center text-brand mb-4">
                    <CheckCircle2 size={24} />
                  </div>
                  <label className="text-base font-bold text-slate-900 dark:text-white">Problems Solved</label>
                  <textarea
                    value={formData.problemsSolved}
                    onChange={e => setFormData({ ...formData, problemsSolved: e.target.value })}
                     className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white min-h-[120px] text-sm resize-none"
                    placeholder="What problems do you solve?"
                  />
                </div>
                <div className="space-y-3 p-6 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                   <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center text-brand mb-4">
                    <Star size={24} />
                  </div>
                  <label className="text-base font-bold text-slate-900 dark:text-white">Trust Factor</label>
                  <textarea
                    value={formData.trustFactor}
                    onChange={e => setFormData({ ...formData, trustFactor: e.target.value })}
                     className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white min-h-[120px] text-sm resize-none"
                    placeholder="Why should clients trust you?"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'social' && (
            <motion.div
              key="social"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 relative z-10"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white">Social Media Links</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400">Links that appear in the footer and contact sections.</p>
                </div>
                <button
                  onClick={() => {
                    const newLinks = [...formData.socialLinks, { name: 'New Link', url: '', iconName: 'globe' }];
                    setFormData({ ...formData, socialLinks: newLinks });
                  }}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-colors w-full sm:w-auto justify-center shadow-sm"
                >
                  <Plus size={18} /> Add Link
                </button>
              </div>
              <div className="space-y-4">
                {formData.socialLinks.map((link, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={index} 
                    className="flex flex-col md:flex-row gap-6 p-6 bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-white/5 rounded-3xl items-start md:items-center group shadow-sm"
                  >
                    <div className="w-16 h-16 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-brand shadow-sm">
                      {getIconByName(link.iconName)}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Platform Name</label>
                        <input
                          value={link.name}
                          onChange={e => {
                            const newLinks = [...formData.socialLinks];
                            newLinks[index].name = e.target.value;
                            setFormData({ ...formData, socialLinks: newLinks });
                          }}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white shadow-sm font-bold"
                          placeholder="e.g. GitHub"
                        />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">URL</label>
                        <input
                          value={link.url}
                          onChange={e => {
                            const newLinks = [...formData.socialLinks];
                            newLinks[index].url = e.target.value;
                            setFormData({ ...formData, socialLinks: newLinks });
                          }}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white shadow-sm font-medium"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Platform Icon</label>
                         <select
                          value={link.iconName}
                          onChange={e => {
                            const newLinks = [...formData.socialLinks];
                            newLinks[index].iconName = e.target.value;
                            setFormData({ ...formData, socialLinks: newLinks });
                          }}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white shadow-sm font-medium appearance-none"
                        >
                          {ICON_NAMES.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const newLinks = formData.socialLinks.filter((_, i) => i !== index);
                        setFormData({ ...formData, socialLinks: newLinks });
                      }}
                       className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-red-500 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-500/10 dark:hover:border-red-500/30 rounded-xl transition-all self-end md:self-center shadow-sm"
                      title="Remove link"
                    >
                      <Trash2 size={20} />
                    </button>
                 </motion.div>
                ))}
                
                {formData.socialLinks.length === 0 && (
                   <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500">No social links added yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
             <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 relative z-10"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white">Success Statistics</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400">Numbers that highlight your achievements.</p>
                </div>
                <button
                  onClick={() => {
                    const newStats = [...formData.stats, { value: '0', suffix: '+', label: 'New Stat' }];
                    setFormData({ ...formData, stats: newStats });
                  }}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-colors w-full sm:w-auto justify-center shadow-sm"
                >
                  <Plus size={18} /> Add Stat
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {formData.stats.map((stat, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={index} 
                    className="p-6 bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-white/5 rounded-3xl relative group shadow-sm"
                  >
                    <button
                      onClick={() => {
                        const newStats = formData.stats.filter((_, i) => i !== index);
                        setFormData({ ...formData, stats: newStats });
                      }}
                       className="absolute top-4 right-4 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-red-500 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-500/10 dark:hover:border-red-500/30 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    <div className="space-y-4 pt-2">
                       <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Value & Suffix</label>
                         <div className="flex gap-2">
                            <input
                              value={stat.value}
                              onChange={e => {
                                const newStats = [...formData.stats];
                                newStats[index].value = e.target.value;
                                setFormData({ ...formData, stats: newStats });
                              }}
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white shadow-sm text-2xl font-black text-center"
                              placeholder="25"
                            />
                            <input
                              value={stat.suffix || ''}
                              onChange={e => {
                                const newStats = [...formData.stats];
                                newStats[index].suffix = e.target.value;
                                setFormData({ ...formData, stats: newStats });
                              }}
                              className="w-20 px-3 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-brand text-brand shadow-sm text-xl font-black text-center"
                              placeholder="+"
                            />
                         </div>
                       </div>
                       
                       <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Label</label>
                         <input
                           value={stat.label}
                           onChange={e => {
                             const newStats = [...formData.stats];
                             newStats[index].label = e.target.value;
                             setFormData({ ...formData, stats: newStats });
                           }}
                           className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white shadow-sm font-bold text-center"
                           placeholder="Projects Completed"
                         />
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'services' && (
             <motion.div
              key="services"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 relative z-10"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white">My Services</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400">What you offer to your clients.</p>
                </div>
                <button
                  onClick={() => {
                    const newServices = [...formData.services, { title: 'New Service', description: '', iconName: 'layers', benefit: '' }];
                    setFormData({ ...formData, services: newServices });
                  }}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-colors w-full sm:w-auto justify-center shadow-sm"
                >
                  <Plus size={18} /> Add Service
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {formData.services.map((service, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={index} 
                    className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 rounded-3xl relative group"
                  >
                    <button
                      onClick={() => {
                        const newServices = formData.services.filter((_, i) => i !== index);
                        setFormData({ ...formData, services: newServices });
                      }}
                       className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                       <div className="lg:col-span-4 space-y-4">
                         <div className="w-16 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-brand shadow-sm mb-6 hidden md:flex">
                            {getIconByName(service.iconName)}
                          </div>
                          
                           <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Icon</label>
                            <select
                              value={service.iconName}
                              onChange={e => {
                                const newServices = [...formData.services];
                                newServices[index].iconName = e.target.value;
                                setFormData({ ...formData, services: newServices });
                              }}
                              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white shadow-sm capitalize appearance-none"
                            >
                              {ICON_NAMES.map(name => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                       </div>
                       <div className="lg:col-span-8 space-y-5">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Service Title</label>
                            <input
                              value={service.title}
                              onChange={e => {
                                const newServices = [...formData.services];
                                newServices[index].title = e.target.value;
                                setFormData({ ...formData, services: newServices });
                              }}
                              className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white shadow-sm font-bold text-lg"
                              placeholder="e.g. Full Stack Development"
                            />
                          </div>
                          
                          <div>
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Main Benefit</label>
                            <input
                              value={service.benefit}
                              onChange={e => {
                                const newServices = [...formData.services];
                                newServices[index].benefit = e.target.value;
                                setFormData({ ...formData, services: newServices });
                              }}
                              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white shadow-sm text-sm"
                              placeholder="e.g. Scalable and secure applications"
                            />
                          </div>
                          
                          <div>
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Detailed Description</label>
                            <textarea
                              value={service.description}
                              onChange={e => {
                                const newServices = [...formData.services];
                                newServices[index].description = e.target.value;
                                setFormData({ ...formData, services: newServices });
                              }}
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white shadow-sm min-h-[100px] text-sm resize-y"
                              placeholder="Describe what this service entails..."
                            />
                          </div>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'process' && (
             <motion.div
              key="process"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 relative z-10"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                 <div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white">Work Process Steps</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400">How you typically work with clients.</p>
                </div>
                <button
                  onClick={() => {
                     // Generate next step number
                    const nextStepNum = formData.process.length + 1;
                    const paddedStep = nextStepNum < 10 ? `0${nextStepNum}` : `${nextStepNum}`;
                    const newProcess = [...formData.process, { step: paddedStep, title: 'New Step', description: '' }];
                    setFormData({ ...formData, process: newProcess });
                  }}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-colors w-full sm:w-auto justify-center shadow-sm"
                >
                  <Plus size={18} /> Add Step
                </button>
              </div>
              <div className="space-y-4">
                {formData.process.map((step, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={index} 
                    className="flex flex-col md:flex-row gap-6 p-6 bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-white/5 rounded-3xl items-start group shadow-sm"
                  >
                     <div className="w-16 h-16 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center shadow-sm relative">
                       <input
                          value={step.step}
                          onChange={e => {
                            const newProcess = [...formData.process];
                            newProcess[index].step = e.target.value;
                            setFormData({ ...formData, process: newProcess });
                          }}
                          className="w-full h-full bg-transparent text-center font-black text-2xl text-brand outline-none"
                        />
                     </div>
                     
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-1 gap-4 w-full pt-1">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Step Title</label>
                        <input
                          value={step.title}
                          onChange={e => {
                            const newProcess = [...formData.process];
                            newProcess[index].title = e.target.value;
                            setFormData({ ...formData, process: newProcess });
                          }}
                           className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white shadow-sm font-bold"
                          placeholder="e.g. Discovery"
                        />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description</label>
                        <textarea
                          value={step.description}
                          onChange={e => {
                            const newProcess = [...formData.process];
                            newProcess[index].description = e.target.value;
                            setFormData({ ...formData, process: newProcess });
                          }}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white shadow-sm resize-y min-h-[80px] text-sm"
                          placeholder="Describe what happens in this step..."
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        const newProcess = formData.process.filter((_, i) => i !== index);
                        setFormData({ ...formData, process: newProcess });
                      }}
                       className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-red-500 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-500/10 dark:hover:border-red-500/30 rounded-xl transition-all self-end md:self-start opacity-0 group-hover:opacity-100 shadow-sm"
                    >
                      <Trash2 size={20} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
