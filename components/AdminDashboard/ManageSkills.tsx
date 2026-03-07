
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-text">Manage Skills</h1>
          <p className="text-theme-dim mt-1">Add, update or remove your technical expertise</p>
        </div>
        <button
          onClick={() => {
            setCurrentSkill({});
            setIsEditing(true);
          }}
          className="bg-brand hover:bg-brand-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all shadow-lg shadow-brand/20"
        >
          <Plus size={20} />
          Add Skill
        </button>
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-theme-card border border-theme-border rounded-2xl p-8 shadow-xl"
          >
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text">Skill Name</label>
                <input
                  required
                  value={currentSkill.name || ''}
                  onChange={e => setCurrentSkill({ ...currentSkill, name: e.target.value })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
                  placeholder="e.g. React.js"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text">Tag</label>
                <input
                  required
                  value={currentSkill.tag || ''}
                  onChange={e => setCurrentSkill({ ...currentSkill, tag: e.target.value })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
                  placeholder="e.g. ENTERPRISE"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <ImageUpload
                  label="Skill Icon (SVG/PNG)"
                  initialValue={currentSkill.icon}
                  onUploadComplete={(url) => setCurrentSkill({ ...currentSkill, icon: url })}
                  folder="skills"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text">Benefit</label>
                <input
                  required
                  value={currentSkill.benefit || ''}
                  onChange={e => setCurrentSkill({ ...currentSkill, benefit: e.target.value })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
                  placeholder="e.g. Building scalable interfaces"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 border border-theme-border rounded-xl text-theme-text hover:bg-theme-bg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-brand hover:bg-brand-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all disabled:opacity-50"
                >
                  {formLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Save Skill
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-theme-card animate-pulse rounded-2xl border border-theme-border" />
          ))
        ) : skills.length === 0 ? (
          <div className="md:col-span-3 py-20 text-center bg-theme-card rounded-2xl border border-dashed border-theme-border">
            <p className="text-theme-dim">No skills found. Add your first skill!</p>
          </div>
        ) : (
          skills.map((skill) => (
            <motion.div
              layout
              key={skill.id}
              className="bg-theme-card border border-theme-border rounded-2xl p-6 flex items-center gap-4 group hover:border-brand/50 transition-all"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-theme-bg rounded-xl p-2">
                <img src={skill.icon} alt={skill.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-theme-text truncate">{skill.name}</h3>
                <p className="text-xs text-brand font-bold uppercase tracking-wider">{skill.tag}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(skill)}
                  className="p-2 text-blue-600 hover:bg-blue-500/10 rounded-lg transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(skill.id!)}
                  className="p-2 text-red-600 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
