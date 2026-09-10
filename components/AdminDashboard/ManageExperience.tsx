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
import { Experience } from '../../types';
import { Plus, Trash2, Edit2, Save, X, Loader2, Briefcase, Award } from 'lucide-react';
import { AdminPageLoader } from './AdminPageLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmationModal } from './ConfirmationModal';
import { AIAssistantInput } from './AIAssistantInput';
import { compileAndSyncToGist } from '../../utils/syncService';

export const ManageExperience: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExp, setCurrentExp] = useState<Partial<Experience>>({});
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
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    if (!isConfigured || !db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Assuming you might want to sort by period or a specific order field in the future
      // For now, let's just fetch them
      const q = query(collection(db, 'experiences'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Experience[];
      // Optional: Sort manually if needed, or rely on an order field. We'll just reverse them to show newest first for now
      setExperiences(data.reverse());
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setFormLoading(true);
    try {
      if (currentExp.id) {
        const { id, ...data } = currentExp;
        await updateDoc(doc(db, 'experiences', id.toString()), {
          ...data,
          technologies: data.technologies || []
        });
      } else {
        const { id, ...expData } = currentExp;
        await addDoc(collection(db, 'experiences'), {
          ...expData,
          technologies: expData.technologies || [],
          id: Date.now().toString()
        });
      }
      setIsEditing(false);
      setCurrentExp({});
      fetchExperiences();
      // Background Sync to Gist
      compileAndSyncToGist().catch(console.error);
      setModalConfig({
        isOpen: true,
        title: 'Success!',
        message: 'Experience has been saved successfully.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving experience:', error);
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: 'Failed to save experience. Please try again.',
        type: 'danger'
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (id: string | number) => {
    if (!db) return;
    setModalConfig({
      isOpen: true,
      title: 'Delete Experience',
      message: 'Are you sure you want to delete this experience record? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'experiences', id.toString()));
          fetchExperiences();
          // Background Sync to Gist
          compileAndSyncToGist().catch(console.error);
        } catch (error) {
          console.error('Error deleting experience:', error);
        }
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Award size={20} className="text-cyan-500" />
            </div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight">Manage Experience</h1>
          </div>
          <p className="text-text-secondary text-sm font-medium pl-[52px]">Update your professional journey and work history.</p>
        </div>
        <button
          onClick={() => {
            setCurrentExp({});
            setIsEditing(true);
            setTimeout(() => document.getElementById('admin-main-content')?.scrollTo({ top: 0, behavior: 'smooth' }), 100);
          }}
          className="bg-brand hover:scale-105 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-transform shadow-lg shadow-brand/20 active:scale-95"
          disabled={isEditing}
        >
          <Plus size={20} />
          Add Experience
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-surface/90 backdrop-blur-xl border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden mb-8">
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface transition-colors z-10"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold text-on-surface mb-8 relative z-10">
                {currentExp.id ? 'Edit Experience' : 'Add New Experience'}
              </h2>

              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Job Role</label>
                  <input
                    required
                    value={currentExp.role || ''}
                    onChange={e => setCurrentExp({ ...currentExp, role: e.target.value })}
                    className="w-full text-base px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                    placeholder="e.g. Senior Frontend Developer"
                   />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Company Name</label>
                  <input
                    required
                    value={currentExp.company || ''}
                    onChange={e => setCurrentExp({ ...currentExp, company: e.target.value })}
                    className="w-full text-base px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                    placeholder="e.g. Google, Remote, etc."
                   />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-on-surface-variant">Time Period</label>
                  <input
                    required
                    value={currentExp.period || ''}
                    onChange={e => setCurrentExp({ ...currentExp, period: e.target.value })}
                    className="w-full text-base px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                    placeholder="e.g. Jan 2021 - Present"
                   />
                </div>

                <AIAssistantInput
                  label="Description"
                  value={currentExp.description || ''}
                  onChange={(val) => setCurrentExp(prev => ({ ...prev, description: val }))}
                  type="textarea"
                  placeholder="Describe your responsibilities and achievements..."
                  fieldType="Job Responsibilities"
                  context={`Job Role: ${currentExp.role || 'Unknown'}, Company Name: ${currentExp.company || 'Unknown'}`}
                  rows={5}
                />

                <div className="md:col-span-2">
                  <AIAssistantInput
                    label="Technologies (comma separated)"
                    value={currentExp.technologies?.join(', ') || ''}
                    onChange={(val) => setCurrentExp(prev => ({ ...prev, technologies: val.split(',').map(s => s.trim()) }))}
                    type="text"
                    placeholder="React, TypeScript, Node.js..."
                    fieldType="Technologies used in this role"
                    context={`Job Role: ${currentExp.role || 'Unknown'}, Company Name: ${currentExp.company || 'Unknown'}, Job Description: ${currentExp.description || 'None'}`}
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 rounded-2xl text-on-surface-variant font-bold hover:bg-surface-variant transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="bg-brand hover:scale-[1.02] active:scale-[0.98] text-white px-8 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-50 min-w-[150px] shadow-lg shadow-brand/20"
                  >
                    {formLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Experience
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <AdminPageLoader icon={Award} color="text-cyan-500" bg="bg-cyan-500/10 border-cyan-500/20" label="Loading experience..." />
      ) : experiences.length === 0 ? (
        <div className="text-center py-20 bg-surface/50 rounded-3xl border border-dashed border-outline-variant">
          <Briefcase size={48} className="mx-auto text-on-surface-variant mb-4" />
          <p className="text-on-surface-variant font-medium text-lg">No experience records found.</p>
          <p className="text-on-surface-variant/70 text-sm mt-1">Click the button above to add your first job role.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {experiences.map((exp) => (
            <motion.div
              key={exp.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-outline-variant rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between group hover:border-primary/30 hover:shadow-lg transition-all shadow-sm"
            >
              <div className="flex-grow space-y-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-brand/10 text-brand text-[10px] font-black tracking-widest uppercase mb-3">
                    {exp.period}
                  </span>
                  <h3 className="text-xl font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">
                    {exp.role}
                  </h3>
                  <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">
                    {exp.company}
                  </h4>
                </div>
                
                <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                  {exp.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {exp.technologies?.map(tech => (
                    <span key={tech} className="px-2.5 py-1 bg-surface-variant border border-outline-variant rounded-lg text-xs font-bold text-on-surface-variant">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 md:flex-col lg:flex-row shrink-0">
                <button
                  onClick={() => {
                    setCurrentExp(exp);
                    setIsEditing(true);
                    setTimeout(() => document.getElementById('admin-main-content')?.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                  }}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-surface-variant hover:bg-outline-variant/30 text-on-surface rounded-2xl font-bold transition-colors"
                >
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(exp.id!)}
                  className="flex items-center justify-center p-3 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-2xl transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
