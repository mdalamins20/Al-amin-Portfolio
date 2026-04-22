
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { Tool } from '../../types';
import { Plus, Trash2, Edit2, Save, X, Loader2, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUpload } from './ImageUpload';

export const ManageSkills: React.FC = () => {
  const [skills, setSkills] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<Partial<Tool>>({});
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'skills'), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      const skillsData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Tool[];
      setSkills(skillsData);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (currentSkill.id) {
        const { id, ...data } = currentSkill;
        await updateDoc(doc(db, 'skills', id), data);
      } else {
        await addDoc(collection(db, 'skills'), currentSkill);
      }
      setIsEditing(false);
      setCurrentSkill({});
      fetchSkills();
    } catch (error) {
      console.error('Error saving skill:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await deleteDoc(doc(db, 'skills', id));
        fetchSkills();
      } catch (error) {
        console.error('Error deleting skill:', error);
      }
    }
  };

  const openEdit = (skill: Tool) => {
    setCurrentSkill(skill);
    setIsEditing(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Manage Skills</h1>
          <p className="text-slate-500 dark:text-slate-400">Add, update or remove your technical expertise and tools.</p>
        </div>
        <button
          onClick={() => {
            setCurrentSkill({});
            setIsEditing(true);
          }}
          className="bg-brand hover:scale-105 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-transform shadow-lg shadow-brand/20 active:scale-95"
          disabled={isEditing}
        >
          <Plus size={20} />
          New Skill
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm relative mb-8 overflow-hidden">
             {/* Subtle background glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-3xl rounded-full pointer-events-none" />
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors z-10"
                title="Close"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 relative z-10">
                {currentSkill.id ? 'Edit Skill' : 'Add New Skill'}
              </h2>

              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Skill Name</label>
                  <input
                    required
                    value={currentSkill.name || ''}
                    onChange={e => setCurrentSkill({ ...currentSkill, name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm"
                    placeholder="e.g. React.js"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tag / Category</label>
                  <input
                    required
                    value={currentSkill.tag || ''}
                    onChange={e => setCurrentSkill({ ...currentSkill, tag: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm"
                    placeholder="e.g. ENTERPRISE"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2 p-6 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Skill Icon (SVG/PNG)</h3>
                  <div className="w-32 sm:w-40">
                  <ImageUpload
                    label=""
                    initialValue={currentSkill.icon}
                    onUploadComplete={(url) => setCurrentSkill({ ...currentSkill, icon: url })}
                    folder="skills"
                    cropShape="rect"
                    aspectRatio={1}
                  />
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Benefit / Summary</label>
                  <input
                    required
                    value={currentSkill.benefit || ''}
                    onChange={e => setCurrentSkill({ ...currentSkill, benefit: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm"
                    placeholder="e.g. Building scalable interfaces"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 rounded-2xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="bg-brand hover:scale-[1.02] active:scale-[0.98] text-white px-8 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-50 min-w-[150px] shadow-lg shadow-brand/20"
                  >
                    {formLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Skill
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-2xl border border-slate-200 dark:border-white/10" />
          ))
        ) : skills.length === 0 ? (
          <div className="md:col-span-3 py-20 text-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Wrench size={32} className="text-brand opacity-80" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">No skills yet</p>
            <p className="text-slate-500 dark:text-slate-400">Click "New Skill" to add your first expertise.</p>
          </div>
        ) : (
          skills.map((skill, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={skill.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex items-center gap-4 group hover:border-brand/40 hover:shadow-xl transition-all shadow-sm"
            >
              <div className="w-14 h-14 shrink-0 flex items-center justify-center bg-slate-50 dark:bg-white/5 rounded-xl p-2.5 shadow-inner border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform duration-300">
                <img src={skill.icon} alt={skill.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate text-lg group-hover:text-brand transition-colors">{skill.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{skill.tag}</p>
              </div>
              <div className="flex flex-col gap-1 opacity-0 translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                <button
                  onClick={() => openEdit(skill)}
                  className="p-1.5 text-slate-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                  title="Edit skill"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(skill.id!)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete skill"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
