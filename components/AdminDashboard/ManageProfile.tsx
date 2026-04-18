
import React, { useState, useEffect } from 'react';
import { useProfile } from '../ProfileContext';
import { Profile, SocialLink, Stat, Service, ProcessStep } from '../../types';
import { Save, Loader2, Plus, Trash2, Edit2, X, Globe, User, Briefcase, Mail, Phone, MapPin, Star, Code, Layers, Zap, Palette, Settings, CheckCircle2, ArrowUpRight, BookOpen } from 'lucide-react';
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
      <div className="flex items-center justify-center py-20">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-text">Manage Profile</h1>
          <p className="text-theme-dim mt-1">Control your personal information and site content</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand hover:bg-brand-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save Changes
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-theme-border pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all ${
                activeTab === tab.id 
                  ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                  : 'text-theme-dim hover:bg-theme-card hover:text-theme-text'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-theme-card border border-theme-border rounded-2xl p-8 shadow-xl">
        <AnimatePresence mode="wait">
          {activeTab === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text">Full Name</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text">Role / Title</label>
                <input
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text">Email</label>
                <input
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text">Phone</label>
                <input
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-theme-text">Tagline (Hero Section)</label>
                <input
                  value={formData.tagline}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-theme-text">Supporting Line (Hero Section)</label>
                <textarea
                  value={formData.supportingLine}
                  onChange={e => setFormData({ ...formData, supportingLine: e.target.value })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text min-h-[100px]"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <ImageUpload
                  label="Profile Image"
                  initialValue={formData.image}
                  onUploadComplete={(url) => setFormData({ ...formData, image: url })}
                  folder="profile"
                  cropShape="round"
                  aspectRatio={1}
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
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text">About Me (Main Text)</label>
                <textarea
                  value={formData.aboutMe}
                  onChange={e => setFormData({ ...formData, aboutMe: e.target.value })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text min-h-[200px]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-theme-text">Who I Help</label>
                  <textarea
                    value={formData.whoIHelp}
                    onChange={e => setFormData({ ...formData, whoIHelp: e.target.value })}
                    className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-theme-text">Problems Solved</label>
                  <textarea
                    value={formData.problemsSolved}
                    onChange={e => setFormData({ ...formData, problemsSolved: e.target.value })}
                    className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-theme-text">Trust Factor</label>
                  <textarea
                    value={formData.trustFactor}
                    onChange={e => setFormData({ ...formData, trustFactor: e.target.value })}
                    className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text min-h-[100px]"
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
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-theme-text">Social Media Links</h3>
                <button
                  onClick={() => {
                    const newLinks = [...formData.socialLinks, { name: 'New Link', url: '', iconName: 'globe' }];
                    setFormData({ ...formData, socialLinks: newLinks });
                  }}
                  className="text-brand hover:text-brand-700 font-bold flex items-center gap-1"
                >
                  <Plus size={18} /> Add Link
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {formData.socialLinks.map((link, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-4 p-4 bg-theme-bg border border-theme-border rounded-xl items-start md:items-center">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      <input
                        value={link.name}
                        onChange={e => {
                          const newLinks = [...formData.socialLinks];
                          newLinks[index].name = e.target.value;
                          setFormData({ ...formData, socialLinks: newLinks });
                        }}
                        className="px-4 py-2 bg-theme-card border border-theme-border rounded-lg outline-none focus:ring-2 focus:ring-brand text-theme-text"
                        placeholder="Name (e.g. GitHub)"
                      />
                      <input
                        value={link.url}
                        onChange={e => {
                          const newLinks = [...formData.socialLinks];
                          newLinks[index].url = e.target.value;
                          setFormData({ ...formData, socialLinks: newLinks });
                        }}
                        className="px-4 py-2 bg-theme-card border border-theme-border rounded-lg outline-none focus:ring-2 focus:ring-brand text-theme-text md:col-span-2"
                        placeholder="URL (https://...)"
                      />
                      <div className="flex items-center gap-4">
                        <select
                          value={link.iconName}
                          onChange={e => {
                            const newLinks = [...formData.socialLinks];
                            newLinks[index].iconName = e.target.value;
                            setFormData({ ...formData, socialLinks: newLinks });
                          }}
                          className="flex-1 px-4 py-2 bg-theme-card border border-theme-border rounded-lg outline-none focus:ring-2 focus:ring-brand text-theme-text"
                        >
                          {ICON_NAMES.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                        <div className="w-10 h-10 bg-theme-card border border-theme-border rounded-lg flex items-center justify-center text-brand">
                          {getIconByName(link.iconName)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const newLinks = formData.socialLinks.filter((_, i) => i !== index);
                        setFormData({ ...formData, socialLinks: newLinks });
                      }}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-theme-text">Success Statistics</h3>
                <button
                  onClick={() => {
                    const newStats = [...formData.stats, { value: '0', suffix: '+', label: 'New Stat' }];
                    setFormData({ ...formData, stats: newStats });
                  }}
                  className="text-brand hover:text-brand-700 font-bold flex items-center gap-1"
                >
                  <Plus size={18} /> Add Stat
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {formData.stats.map((stat, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-4 p-4 bg-theme-bg border border-theme-border rounded-xl items-start md:items-center">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      <input
                        value={stat.value}
                        onChange={e => {
                          const newStats = [...formData.stats];
                          newStats[index].value = e.target.value;
                          setFormData({ ...formData, stats: newStats });
                        }}
                        className="px-4 py-2 bg-theme-card border border-theme-border rounded-lg outline-none focus:ring-2 focus:ring-brand text-theme-text"
                        placeholder="Value (e.g. 25)"
                      />
                      <input
                        value={stat.suffix || ''}
                        onChange={e => {
                          const newStats = [...formData.stats];
                          newStats[index].suffix = e.target.value;
                          setFormData({ ...formData, stats: newStats });
                        }}
                        className="px-4 py-2 bg-theme-card border border-theme-border rounded-lg outline-none focus:ring-2 focus:ring-brand text-theme-text"
                        placeholder="Suffix (e.g. +)"
                      />
                      <input
                        value={stat.label}
                        onChange={e => {
                          const newStats = [...formData.stats];
                          newStats[index].label = e.target.value;
                          setFormData({ ...formData, stats: newStats });
                        }}
                        className="px-4 py-2 bg-theme-card border border-theme-border rounded-lg outline-none focus:ring-2 focus:ring-brand text-theme-text"
                        placeholder="Label (e.g. Projects)"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newStats = formData.stats.filter((_, i) => i !== index);
                        setFormData({ ...formData, stats: newStats });
                      }}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
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
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-theme-text">My Services</h3>
                <button
                  onClick={() => {
                    const newServices = [...formData.services, { title: 'New Service', description: '', iconName: 'layers', benefit: '' }];
                    setFormData({ ...formData, services: newServices });
                  }}
                  className="text-brand hover:text-brand-700 font-bold flex items-center gap-1"
                >
                  <Plus size={18} /> Add Service
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {formData.services.map((service, index) => (
                  <div key={index} className="p-6 bg-theme-bg border border-theme-border rounded-2xl relative group">
                    <button
                      onClick={() => {
                        const newServices = formData.services.filter((_, i) => i !== index);
                        setFormData({ ...formData, services: newServices });
                      }}
                      className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-theme-dim uppercase">Service Title</label>
                          <input
                            value={service.title}
                            onChange={e => {
                              const newServices = [...formData.services];
                              newServices[index].title = e.target.value;
                              setFormData({ ...formData, services: newServices });
                            }}
                            className="w-full px-4 py-2 bg-theme-card border border-theme-border rounded-lg outline-none focus:ring-2 focus:ring-brand text-theme-text"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-theme-dim uppercase">Icon</label>
                          <div className="flex items-center gap-4">
                            <select
                              value={service.iconName}
                              onChange={e => {
                                const newServices = [...formData.services];
                                newServices[index].iconName = e.target.value;
                                setFormData({ ...formData, services: newServices });
                              }}
                              className="flex-1 px-4 py-2 bg-theme-card border border-theme-border rounded-lg outline-none focus:ring-2 focus:ring-brand text-theme-text"
                            >
                              {ICON_NAMES.map(name => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </select>
                            <div className="w-10 h-10 bg-theme-card border border-theme-border rounded-lg flex items-center justify-center text-brand">
                              {getIconByName(service.iconName)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-theme-dim uppercase">Description</label>
                          <textarea
                            value={service.description}
                            onChange={e => {
                              const newServices = [...formData.services];
                              newServices[index].description = e.target.value;
                              setFormData({ ...formData, services: newServices });
                            }}
                            className="w-full px-4 py-2 bg-theme-card border border-theme-border rounded-lg outline-none focus:ring-2 focus:ring-brand text-theme-text min-h-[80px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-theme-dim uppercase">Benefit</label>
                          <input
                            value={service.benefit}
                            onChange={e => {
                              const newServices = [...formData.services];
                              newServices[index].benefit = e.target.value;
                              setFormData({ ...formData, services: newServices });
                            }}
                            className="w-full px-4 py-2 bg-theme-card border border-theme-border rounded-lg outline-none focus:ring-2 focus:ring-brand text-theme-text"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
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
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-theme-text">Work Process Steps</h3>
                <button
                  onClick={() => {
                    const newProcess = [...formData.process, { step: '0' + (formData.process.length + 1), title: 'New Step', description: '' }];
                    setFormData({ ...formData, process: newProcess });
                  }}
                  className="text-brand hover:text-brand-700 font-bold flex items-center gap-1"
                >
                  <Plus size={18} /> Add Step
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {formData.process.map((step, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-4 p-4 bg-theme-bg border border-theme-border rounded-xl items-start md:items-center">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                      <input
                        value={step.step}
                        onChange={e => {
                          const newProcess = [...formData.process];
                          newProcess[index].step = e.target.value;
                          setFormData({ ...formData, process: newProcess });
                        }}
                        className="px-4 py-2 bg-theme-card border border-theme-border rounded-lg outline-none focus:ring-2 focus:ring-brand text-theme-text"
                        placeholder="Step (e.g. 01)"
                      />
                      <input
                        value={step.title}
                        onChange={e => {
                          const newProcess = [...formData.process];
                          newProcess[index].title = e.target.value;
                          setFormData({ ...formData, process: newProcess });
                        }}
                        className="px-4 py-2 bg-theme-card border border-theme-border rounded-lg outline-none focus:ring-2 focus:ring-brand text-theme-text"
                        placeholder="Title"
                      />
                      <input
                        value={step.description}
                        onChange={e => {
                          const newProcess = [...formData.process];
                          newProcess[index].description = e.target.value;
                          setFormData({ ...formData, process: newProcess });
                        }}
                        className="px-4 py-2 bg-theme-card border border-theme-border rounded-lg outline-none focus:ring-2 focus:ring-brand text-theme-text md:col-span-2"
                        placeholder="Description"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newProcess = formData.process.filter((_, i) => i !== index);
                        setFormData({ ...formData, process: newProcess });
                      }}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
