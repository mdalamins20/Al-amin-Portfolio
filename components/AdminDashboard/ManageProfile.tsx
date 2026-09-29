import React, { useState, useEffect } from 'react';
import { useProfileStore } from '../stores/useProfileStore';
import { Profile, SocialLink, Stat, Service, ProcessStep } from '../../types';
import { Save, Loader2, Plus, Trash2, Globe, User, BookOpen, Star, Layers, Zap, Mail, Phone, CheckCircle2, Github, Activity, MapPin, Map } from 'lucide-react';
import { AdminPageLoader } from './AdminPageLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { getIconByName, ICON_NAMES } from '../IconMapper';
import { ImageUpload } from './ImageUpload';
import { FileUpload } from './FileUpload';
import { ConfirmationModal } from './ConfirmationModal';
import { AIAssistantInput } from './AIAssistantInput';
import { compileAndSyncToGist } from '../../utils/syncService';
import { fetchGithubContributions } from '../../utils/githubService';
import { logActivity } from '../../utils/activityLogger';

export const ManageProfile: React.FC = () => {
  const { profile, loading, updateProfile } = useProfileStore();
  const [formData, setFormData] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'about' | 'social' | 'stats' | 'services' | 'process'>('basic');
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'success' | 'info';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

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
      await logActivity('update', 'profile', 'Profile', 'Updated profile information');
      // Background Sync to Gist
      compileAndSyncToGist().catch(console.error);
      setModalConfig({
        isOpen: true,
        title: 'Success!',
        message: 'Profile updated successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: 'Failed to update profile. Please try again.',
        type: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };

  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const handleSyncGithub = async () => {
    if (!formData) return;
    setIsSyncingGithub(true);
    try {
      const username = formData.githubUsername || 'mdalamins20';
      const data = await fetchGithubContributions(username);
      setFormData({
        ...formData,
        githubReposCount: data.stats.repos.toString(),
        githubTotalStars: data.stats.stars.toString(),
        githubTotalForks: data.stats.forks.toString(),
        githubTotalContributions: data.stats.totalContributions.toString()
      });
      setModalConfig({
        isOpen: true,
        title: 'Success!',
        message: 'GitHub stats synced successfully! Click Save Changes to update your profile.',
        type: 'success'
      });
    } catch (error: any) {
      setModalConfig({
        isOpen: true,
        title: 'Sync Failed',
        message: error.message || 'Make sure your GitHub Token is set in AI Settings.',
        type: 'danger'
      });
    } finally {
      setIsSyncingGithub(false);
    }
  };

  if (loading || !formData) {
    return <AdminPageLoader icon={User} color="text-violet-500" bg="bg-violet-500/10 border-violet-500/20" label="Loading profile..." />;
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
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <User size={20} className="text-violet-500" />
            </div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight">Manage Profile</h1>
          </div>
          <p className="text-text-secondary text-sm font-medium pl-[52px]">Control your personal information and site content</p>
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

      <div className="flex overflow-x-auto pb-4 gap-2 border-b border-outline-variant mask-edges" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style dangerouslySetInnerHTML={{__html: `
          .mask-edges::-webkit-scrollbar { display: none; }
        `}} />
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-on-surface text-surface shadow-md' 
                  : 'bg-white dark:bg-transparent border border-outline-variant text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              <Icon size={18} className={activeTab === tab.id ? 'text-brand dark:text-brand' : ''} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-surface border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm overflow-hidden relative">
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
              <div className="md:col-span-2 flex flex-col lg:flex-row gap-10 items-start pb-8 border-b border-outline-variant">
                
                <div className="flex flex-wrap gap-8 items-start">
                  <div className="shrink-0 space-y-4">
                    <h3 className="font-bold text-on-surface">Profile Picture</h3>
                    <div className="w-32 sm:w-40">
                      <ImageUpload
                        label=""
                        initialValue={formData.image}
                        onUploadComplete={(url) => setFormData({ ...formData, image: url })}
                        folder="profile"
                        cropShape="rect"
                        maxWidth={2560}
                        maxHeight={2560}
                        quality={0.95}
                      />
                    </div>
                  </div>

                  <div className="shrink-0 space-y-4">
                    <h3 className="font-bold text-on-surface">Favicon Icon</h3>
                    <div className="w-24 sm:w-28">
                      <ImageUpload
                        label=""
                        initialValue={formData.favicon}
                        onUploadComplete={(url) => setFormData({ ...formData, favicon: url })}
                        folder="settings"
                        cropShape="rect"
                        aspectRatio={1}
                        maxWidth={128}
                        maxHeight={128}
                      />
                    </div>
                  </div>

                  <div className="shrink-0 space-y-4">
                    <h3 className="font-bold text-on-surface">Resume (PDF)</h3>
                    <div className="w-48 sm:w-56">
                      <FileUpload
                        label=""
                        initialValue={formData.cvFileUrl}
                        onUploadComplete={(url) => setFormData({ ...formData, cvFileUrl: url })}
                        folder="resumes"
                        accept=".pdf"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full min-w-[280px] grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface-variant">Full Name</label>
                    <input
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-base px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface-variant">Role / Title</label>
                    <input
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="w-full text-base px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-base pl-11 pr-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-base pl-11 pr-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant">Location Text</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input
                    value={formData.locationText || ''}
                    onChange={e => setFormData({ ...formData, locationText: e.target.value })}
                    className="w-full text-base pl-11 pr-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                    placeholder="e.g. Dhaka, Bangladesh"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant flex items-center justify-between">
                  <span>Google Maps Embed URL</span>
                  <span className="text-xs font-normal text-text-secondary bg-surface-variant px-2 py-0.5 rounded">Optional</span>
                </label>
                <div className="relative">
                  <Map className="absolute left-4 top-4 text-on-surface-variant" size={18} />
                  <textarea
                    value={formData.mapEmbedUrl || ''}
                    onChange={e => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
                    className="w-full text-base pl-11 pr-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm resize-y min-h-[100px]"
                    placeholder='e.g. https://www.google.com/maps/embed?pb=...'
                  />
                </div>
                <p className="text-xs text-text-secondary mt-1 ml-2">Go to Google Maps &gt; Share &gt; Embed a map &gt; Copy the "src" URL only (not the whole iframe tag).</p>
              </div>
              
              <div className="space-y-2 md:col-span-2 flex justify-end">
                <button
                  onClick={handleSyncGithub}
                  disabled={isSyncingGithub}
                  className="bg-brand/10 hover:bg-brand/20 text-brand px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all disabled:opacity-50"
                >
                  {isSyncingGithub ? <Loader2 className="animate-spin" size={16} /> : <Github size={16} />}
                  {isSyncingGithub ? 'Syncing...' : 'Sync GitHub Stats Automatically'}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant">GitHub Repositories Count</label>
                <div className="relative">
                  <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input
                    value={formData.githubReposCount || ''}
                    onChange={e => setFormData({ ...formData, githubReposCount: e.target.value })}
                    placeholder="e.g. 14"
                    className="w-full text-base pl-11 pr-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant">GitHub Total Stars</label>
                <div className="relative">
                  <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input
                    value={formData.githubTotalStars || ''}
                    onChange={e => setFormData({ ...formData, githubTotalStars: e.target.value })}
                    placeholder="e.g. 120"
                    className="w-full text-base pl-11 pr-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant">GitHub Total Forks</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input
                    value={formData.githubTotalForks || ''}
                    onChange={e => setFormData({ ...formData, githubTotalForks: e.target.value })}
                    placeholder="e.g. 35"
                    className="w-full text-base pl-11 pr-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2 pt-2 pb-4">
                <label className="text-sm font-bold text-on-surface-variant">GitHub Total Contributions</label>
                <div className="relative w-full md:w-1/2">
                  <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input
                    value={formData.githubTotalContributions || ''}
                    onChange={e => setFormData({ ...formData, githubTotalContributions: e.target.value })}
                    placeholder="e.g. 1,250+"
                    className="w-full text-base pl-11 pr-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2 pt-4">
                <AIAssistantInput
                  label="Tagline (Hero Section)"
                  value={formData.tagline}
                  onChange={value => setFormData({ ...formData, tagline: value })}
                  type="text"
                  fieldType="Tagline"
                  className="w-full"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <AIAssistantInput
                  label="Supporting Line (Hero Section)"
                  value={formData.supportingLine}
                  onChange={value => setFormData({ ...formData, supportingLine: value })}
                  type="textarea"
                  rows={4}
                  fieldType="Supporting Line"
                  className="w-full"
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
                <div className="flex flex-col mb-4">
                  <label className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <User size={20} className="text-brand" />
                    About Me (Main Text)
                  </label>
                  <p className="text-on-surface-variant text-sm">This usually appears on the About page or section.</p>
                </div>
                <AIAssistantInput
                  label=""
                  value={formData.aboutMe}
                  onChange={value => setFormData({ ...formData, aboutMe: value })}
                  type="textarea"
                  rows={8}
                  fieldType="About Me Description"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-col mb-4">
                  <label className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <BookOpen size={20} className="text-brand" />
                    CV Professional Summary (For PDF)
                  </label>
                  <p className="text-on-surface-variant text-sm">This is the short executive summary that will appear at the top of your downloaded PDF CV.</p>
                </div>
                <AIAssistantInput
                  label=""
                  value={formData.cvSummary || ''}
                  onChange={value => setFormData({ ...formData, cvSummary: value })}
                  type="textarea"
                  rows={4}
                  fieldType="CV Professional Summary"
                  placeholder="Click the AI button to generate a summary based on your profile!"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-outline-variant">
                <div className="space-y-3 p-6 bg-surface-variant/50 rounded-3xl border border-outline-variant shadow-sm">
                  <div className="w-12 h-12 bg-surface rounded-2xl shadow-sm flex items-center justify-center text-brand mb-4">
                    <User size={24} />
                  </div>
                  <AIAssistantInput
                    label="Who I Help"
                    value={formData.whoIHelp}
                    onChange={value => setFormData({ ...formData, whoIHelp: value })}
                    type="textarea"
                    rows={4}
                    fieldType="Target Audience Description"
                    placeholder="Describe your target audience..."
                  />
                </div>
                <div className="space-y-3 p-6 bg-surface-variant/50 rounded-3xl border border-outline-variant shadow-sm">
                   <div className="w-12 h-12 bg-surface rounded-2xl shadow-sm flex items-center justify-center text-brand mb-4">
                    <CheckCircle2 size={24} />
                  </div>
                  <AIAssistantInput
                    label="Problems Solved"
                    value={formData.problemsSolved}
                    onChange={value => setFormData({ ...formData, problemsSolved: value })}
                    type="textarea"
                    rows={4}
                    fieldType="Problems Solved Description"
                    placeholder="What problems do you solve?"
                  />
                </div>
                <div className="space-y-3 p-6 bg-surface-variant/50 rounded-3xl border border-outline-variant shadow-sm">
                   <div className="w-12 h-12 bg-surface rounded-2xl shadow-sm flex items-center justify-center text-brand mb-4">
                    <Star size={24} />
                  </div>
                  <AIAssistantInput
                    label="Trust Factor"
                    value={formData.trustFactor}
                    onChange={value => setFormData({ ...formData, trustFactor: value })}
                    type="textarea"
                    rows={4}
                    fieldType="Trust Factor Description"
                    placeholder="Why should they trust you?"
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
                   <h3 className="text-xl font-bold text-on-surface">Social Media Links</h3>
                   <p className="text-sm text-on-surface-variant">Links that appear in the footer and contact sections.</p>
                </div>
                <button
                  onClick={() => {
                    const newLinks = [...formData.socialLinks, { name: 'New Link', url: '', iconName: 'globe' }];
                    setFormData({ ...formData, socialLinks: newLinks });
                  }}
                  className="bg-surface-variant hover:bg-surface-container-high text-on-surface px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-colors w-full sm:w-auto justify-center shadow-sm"
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
                    className="flex flex-col md:flex-row gap-6 p-6 bg-surface-container-low dark:bg-surface-container-low border border-outline-variant rounded-3xl items-start md:items-center group shadow-sm"
                  >
                    <div className="w-16 h-16 shrink-0 bg-surface border border-outline-variant rounded-2xl flex items-center justify-center text-brand shadow-sm">
                      {getIconByName(link.iconName)}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div>
                        <label className="text-xs font-bold text-on-surface-variant uppercase mb-1 block">Platform Name</label>
                        <input
                          value={link.name}
                          onChange={e => {
                            const newLinks = [...formData.socialLinks];
                            newLinks[index].name = e.target.value;
                            setFormData({ ...formData, socialLinks: newLinks });
                          }}
                          className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-brand text-on-surface shadow-sm font-bold"
                          placeholder="e.g. GitHub"
                        />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-on-surface-variant uppercase mb-1 block">URL</label>
                        <input
                          value={link.url}
                          onChange={e => {
                            const newLinks = [...formData.socialLinks];
                            newLinks[index].url = e.target.value;
                            setFormData({ ...formData, socialLinks: newLinks });
                          }}
                          className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-brand text-on-surface shadow-sm font-medium"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase mb-1 block">Platform Icon</label>
                         <select
                          value={link.iconName}
                          onChange={e => {
                            const newLinks = [...formData.socialLinks];
                            newLinks[index].iconName = e.target.value;
                            setFormData({ ...formData, socialLinks: newLinks });
                          }}
                          className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-brand text-on-surface shadow-sm font-medium appearance-none"
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
                       className="p-3 bg-surface border border-outline-variant text-red-500 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-500/10 dark:hover:border-red-500/30 rounded-xl transition-all self-end md:self-center shadow-sm"
                      title="Remove link"
                    >
                      <Trash2 size={20} />
                    </button>
                 </motion.div>
                ))}
                
                {formData.socialLinks.length === 0 && (
                   <div className="py-12 text-center bg-surface-variant/50 rounded-3xl border border-dashed border-outline-variant">
                    <p className="text-on-surface-variant">No social links added yet.</p>
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
                   <h3 className="text-xl font-bold text-on-surface">Success Statistics</h3>
                   <p className="text-sm text-on-surface-variant">Numbers that highlight your achievements.</p>
                </div>
                <button
                  onClick={() => {
                    const newStats = [...formData.stats, { value: '0', suffix: '+', label: 'New Stat' }];
                    setFormData({ ...formData, stats: newStats });
                  }}
                  className="bg-surface-variant hover:bg-surface-container-high text-on-surface px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-colors w-full sm:w-auto justify-center shadow-sm"
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
                    className="p-6 bg-surface-variant/50 border border-outline-variant rounded-3xl relative group shadow-sm"
                  >
                    <button
                      onClick={() => {
                        const newStats = formData.stats.filter((_, i) => i !== index);
                        setFormData({ ...formData, stats: newStats });
                      }}
                       className="absolute top-4 right-4 p-2 bg-surface border border-outline-variant text-red-500 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-500/10 dark:hover:border-red-500/30 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    <div className="space-y-4 pt-2">
                       <div>
                         <label className="text-xs font-bold text-on-surface-variant uppercase mb-1 block">Value & Suffix</label>
                         <div className="flex gap-2">
                            <input
                              value={stat.value}
                              onChange={e => {
                                const newStats = [...formData.stats];
                                newStats[index].value = e.target.value;
                                setFormData({ ...formData, stats: newStats });
                              }}
                              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-brand text-on-surface shadow-sm text-2xl font-black text-center"
                              placeholder="25"
                            />
                            <input
                              value={stat.suffix || ''}
                              onChange={e => {
                                const newStats = [...formData.stats];
                                newStats[index].suffix = e.target.value;
                                setFormData({ ...formData, stats: newStats });
                              }}
                              className="w-20 px-3 py-3 bg-surface border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-brand text-brand shadow-sm text-xl font-black text-center"
                              placeholder="+"
                            />
                         </div>
                       </div>
                       
                       <div>
                         <label className="text-xs font-bold text-on-surface-variant uppercase mb-1 block">Label</label>
                         <input
                           value={stat.label}
                           onChange={e => {
                             const newStats = [...formData.stats];
                             newStats[index].label = e.target.value;
                             setFormData({ ...formData, stats: newStats });
                           }}
                           className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-brand text-on-surface shadow-sm font-bold text-center"
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
                   <h3 className="text-xl font-bold text-on-surface">My Services</h3>
                   <p className="text-sm text-on-surface-variant">What you offer to your clients.</p>
                </div>
                <button
                  onClick={() => {
                    const newServices = [...formData.services, { title: 'New Service', description: '', iconName: 'layers', benefit: '' }];
                    setFormData({ ...formData, services: newServices });
                  }}
                  className="bg-surface-variant hover:bg-surface-container-high text-on-surface px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-colors w-full sm:w-auto justify-center shadow-sm"
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
                    className="p-6 md:p-8 bg-surface-variant/50 border border-outline-variant rounded-3xl relative group"
                  >
                    <button
                      onClick={() => {
                        const newServices = formData.services.filter((_, i) => i !== index);
                        setFormData({ ...formData, services: newServices });
                      }}
                       className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                       <div className="lg:col-span-4 space-y-4">
                         <div className="w-16 h-16 bg-surface border border-outline-variant rounded-2xl flex items-center justify-center text-brand shadow-sm mb-6 hidden md:flex">
                            {getIconByName(service.iconName)}
                          </div>
                          
                           <div>
                            <label className="text-xs font-bold text-on-surface-variant uppercase mb-1 block">Icon</label>
                            <select
                              value={service.iconName}
                              onChange={e => {
                                const newServices = [...formData.services];
                                newServices[index].iconName = e.target.value;
                                setFormData({ ...formData, services: newServices });
                              }}
                              className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-brand text-on-surface shadow-sm capitalize appearance-none"
                            >
                              {ICON_NAMES.map(name => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                       </div>
                       <div className="lg:col-span-8 space-y-5">
                          <div>
                            <label className="text-xs font-bold text-on-surface-variant uppercase mb-1 block">Service Title</label>
                            <input
                              value={service.title}
                              onChange={e => {
                                const newServices = [...formData.services];
                                newServices[index].title = e.target.value;
                                setFormData({ ...formData, services: newServices });
                              }}
                              className="w-full px-5 py-3.5 bg-surface border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface shadow-sm font-bold text-lg"
                              placeholder="e.g. Full Stack Development"
                            />
                          </div>
                          
                          <div>
                             <label className="text-xs font-bold text-on-surface-variant uppercase mb-1 block">Main Benefit</label>
                            <input
                              value={service.benefit}
                              onChange={e => {
                                const newServices = [...formData.services];
                                newServices[index].benefit = e.target.value;
                                setFormData({ ...formData, services: newServices });
                              }}
                              className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-brand text-on-surface shadow-sm text-sm"
                              placeholder="e.g. Scalable and secure applications"
                            />
                          </div>
                          
                          <div>
                             <label className="text-xs font-bold text-on-surface-variant uppercase mb-1 block">Detailed Description</label>
                            <textarea
                              value={service.description}
                              onChange={e => {
                                const newServices = [...formData.services];
                                newServices[index].description = e.target.value;
                                setFormData({ ...formData, services: newServices });
                              }}
                              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-brand text-on-surface shadow-sm min-h-[100px] text-sm resize-y"
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
                   <h3 className="text-xl font-bold text-on-surface">Work Process Steps</h3>
                   <p className="text-sm text-on-surface-variant">How you typically work with clients.</p>
                </div>
                <button
                  onClick={() => {
                     // Generate next step number
                    const nextStepNum = formData.process.length + 1;
                    const paddedStep = nextStepNum < 10 ? `0${nextStepNum}` : `${nextStepNum}`;
                    const newProcess = [...formData.process, { step: paddedStep, title: 'New Step', description: '' }];
                    setFormData({ ...formData, process: newProcess });
                  }}
                  className="bg-surface-variant hover:bg-surface-container-high text-on-surface px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-colors w-full sm:w-auto justify-center shadow-sm"
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
                    className="flex flex-col md:flex-row gap-6 p-6 bg-surface-variant/50 border border-outline-variant rounded-3xl items-start group shadow-sm"
                  >
                     <div className="w-16 h-16 shrink-0 bg-surface border border-outline-variant rounded-2xl flex items-center justify-center shadow-sm relative">
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
                        <label className="text-xs font-bold text-on-surface-variant uppercase mb-1 block">Step Title</label>
                        <input
                          value={step.title}
                          onChange={e => {
                            const newProcess = [...formData.process];
                            newProcess[index].title = e.target.value;
                            setFormData({ ...formData, process: newProcess });
                          }}
                           className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-brand text-on-surface shadow-sm font-bold"
                          placeholder="e.g. Discovery"
                        />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-on-surface-variant uppercase mb-1 block">Description</label>
                        <textarea
                          value={step.description}
                          onChange={e => {
                            const newProcess = [...formData.process];
                            newProcess[index].description = e.target.value;
                            setFormData({ ...formData, process: newProcess });
                          }}
                          className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-brand text-on-surface shadow-sm resize-y min-h-[80px] text-sm"
                          placeholder="Describe what happens in this step..."
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        const newProcess = formData.process.filter((_, i) => i !== index);
                        setFormData({ ...formData, process: newProcess });
                      }}
                       className="p-3 bg-surface border border-outline-variant text-red-500 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-500/10 dark:hover:border-red-500/30 rounded-xl transition-all self-end md:self-start opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-sm"
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

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
};
