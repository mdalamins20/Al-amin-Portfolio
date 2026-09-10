
import React, { useState, useEffect } from 'react';
import { db, isConfigured } from '../../firebase';
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
import { Plus, Loader2, Trash2, Edit2, Save, X, Code2, Wrench } from 'lucide-react';
import { AdminPageLoader } from './AdminPageLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmationModal } from './ConfirmationModal';
import { ImageUpload } from './ImageUpload';
import { compileAndSyncToGist } from '../../utils/syncService';

export const ManageSkills: React.FC = () => {
  const [skills, setSkills] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<Partial<Tool>>({});
  const [formLoading, setFormLoading] = useState(false);
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
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    if (!isConfigured || !db) {
      setLoading(false);
      return;
    }
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
    if (!db) return;
    setFormLoading(true);
    try {
      if (currentSkill.id) {
        const { id, ...data } = currentSkill;
        await updateDoc(doc(db, 'skills', id), data);
      } else {
        const { id: _, ...skillData } = currentSkill;
        await addDoc(collection(db, 'skills'), {
          ...skillData,
          id: Date.now().toString()
        });
      }
      setIsEditing(false);
      setCurrentSkill({});
      fetchSkills();
      // Background Sync to Gist
      compileAndSyncToGist().catch(console.error);
      setModalConfig({
        isOpen: true,
        title: 'Success!',
        message: 'Skill has been saved successfully.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving skill:', error);
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: 'Failed to save skill. Please try again.',
        type: 'danger'
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!db) return;
    setModalConfig({
      isOpen: true,
      title: 'Delete Skill',
      message: 'Are you sure you want to delete this skill? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'skills', id));
          fetchSkills();
          // Background Sync to Gist
          compileAndSyncToGist().catch(console.error);
        } catch (error) {
          console.error('Error deleting skill:', error);
        }
      }
    });
  };

  const openEdit = (skill: Tool) => {
    setCurrentSkill(skill);
    setIsEditing(true);
    setTimeout(() => document.getElementById('admin-main-content')?.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
              <Wrench size={20} className="text-pink-500" />
            </div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight">Manage Skills</h1>
          </div>
          <p className="text-text-secondary text-sm font-medium pl-[52px]">Add, update or remove your technical expertise and tools.</p>
        </div>
        <button
          onClick={() => {
            setCurrentSkill({});
            setIsEditing(true);
            setTimeout(() => document.getElementById('admin-main-content')?.scrollTo({ top: 0, behavior: 'smooth' }), 100);
          }}
          className="bg-primary text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 text-sm"
          disabled={isEditing}
        >
          <Plus size={18} />
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
            <div className="bg-surface/95 dark:bg-slate-950/90 backdrop-blur-2xl border border-surface-variant/30 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative mb-8 overflow-hidden">
             {/* Subtle background glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-6 right-6 text-text-secondary hover:text-on-surface transition-colors z-10 p-1.5 rounded-xl hover:bg-surface-variant/20"
                title="Close"
              >
                <X size={22} />
              </button>
              
              <h2 className="text-2xl font-black text-on-surface mb-6 relative z-10 tracking-tight">
                {currentSkill.id ? 'Edit Skill' : 'Add New Skill'}
              </h2>

              <form onSubmit={handleSave} className="grid grid-cols-1 gap-5 relative z-10">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Skill Name</label>
                  <input
                    required
                    value={currentSkill.name || ''}
                    onChange={e => setCurrentSkill({ ...currentSkill, name: e.target.value })}
                    className="w-full text-sm px-4 py-3.5 bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary text-on-surface transition-all shadow-sm font-medium"
                    placeholder="e.g. React.js"
                  />
                </div>
                
                <div className="space-y-2 p-5 bg-surface-variant/10 dark:bg-white/5 rounded-3xl border border-surface-variant/30 dark:border-white/10 shadow-sm">
                  <h3 className="font-bold text-sm text-on-surface mb-3">Skill Icon (SVG/PNG)</h3>
                  <div className="w-32 sm:w-40">
                  <ImageUpload
                    label=""
                    initialValue={currentSkill.icon}
                    onUploadComplete={(url) => setCurrentSkill({ ...currentSkill, icon: url })}
                    folder="skills"
                    cropShape="rect"
                    aspectRatio={1}
                    maxWidth={256}
                    maxHeight={256}
                  />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-5 border-t border-surface-variant/20 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 rounded-2xl text-text-secondary font-bold hover:bg-surface-variant/20 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="bg-primary text-white px-8 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 min-w-[150px] shadow-lg shadow-primary/25 text-sm"
                  >
                    {formLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Skill
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {!isConfigured ? (
          <div className="md:col-span-3 py-20 text-center bg-red-500/10 rounded-3xl border border-dashed border-red-500/20 shadow-sm">
             <p className="text-xl font-bold text-red-500 mb-2">Firebase Not Configured</p>
             <p className="text-text-secondary text-sm">Please check your .env file or firebase.ts configuration.</p>
          </div>
        ) : loading ? (
          <AdminPageLoader icon={Wrench} color="text-pink-500" bg="bg-pink-500/10 border-pink-500/20" label="Loading skills..." />
        ) : skills.length === 0 ? (
          <div className="md:col-span-3 py-20 text-center bg-surface-variant/10 dark:bg-white/5 rounded-3xl border border-dashed border-surface-variant/40 dark:border-white/10 shadow-sm">
            <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-surface-variant/30">
              <Wrench size={28} className="text-primary opacity-80" />
            </div>
            <p className="text-lg font-bold text-on-surface mb-1">No skills yet</p>
            <p className="text-text-secondary text-xs">Click "New Skill" to add your first expertise.</p>
          </div>
        ) : (
          skills.map((skill, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={skill.id}
              className="bg-surface/90 dark:bg-slate-950/70 backdrop-blur-xl border border-surface-variant/30 dark:border-white/10 rounded-2xl p-4 flex items-center gap-4 group hover:border-primary/40 hover:shadow-xl transition-all shadow-sm"
            >
              <div className="w-14 h-14 shrink-0 flex items-center justify-center bg-surface-variant/20 dark:bg-white/5 rounded-xl p-2.5 shadow-inner border border-surface-variant/30 dark:border-white/5 group-hover:scale-105 transition-transform duration-300">
                <img src={skill.icon} alt={skill.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-on-surface break-words text-base group-hover:text-primary transition-colors leading-snug">{skill.name}</h3>
              </div>
              <div className="flex flex-col gap-1 opacity-0 translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200">
                <button
                  onClick={() => openEdit(skill)}
                  className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Edit skill"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(skill.id!)}
                  className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete skill"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))
        )}
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
