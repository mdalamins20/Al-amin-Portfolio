
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
import { Project } from '../../types';
import { Plus, Trash2, Edit2, ExternalLink, Save, X, Loader2, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUpload } from './ImageUpload';

export const ManageProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'projects'), orderBy('id', 'desc'));
      const querySnapshot = await getDocs(q);
      const projectsData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Project[];
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (currentProject.id) {
        const { id, ...data } = currentProject;
        await updateDoc(doc(db, 'projects', id), data);
      } else {
        await addDoc(collection(db, 'projects'), {
          ...currentProject,
          id: Date.now().toString() // Use timestamp as a temporary ID if needed
        });
      }
      setIsEditing(false);
      setCurrentProject({});
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const openEdit = (project: Project) => {
    setCurrentProject(project);
    setIsEditing(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-text">Manage Projects</h1>
          <p className="text-theme-dim mt-1">Add, update or remove portfolio projects</p>
        </div>
        <button
          onClick={() => {
            setCurrentProject({});
            setIsEditing(true);
          }}
          className="bg-brand hover:bg-brand-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all shadow-lg shadow-brand/20"
        >
          <Plus size={20} />
          Add Project
        </button>
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
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
                {currentProject.id ? 'Edit Project' : 'Add New Project'}
              </h2>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Project Title</label>
                <input
                  required
                  value={currentProject.title || ''}
                  onChange={e => setCurrentProject({ ...currentProject, title: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm"
                  placeholder="e.g. AI Branding Tool"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category</label>
                <input
                  required
                  value={currentProject.category || ''}
                  onChange={e => setCurrentProject({ ...currentProject, category: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm"
                  placeholder="e.g. Automation"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  required
                  value={currentProject.description || ''}
                  onChange={e => setCurrentProject({ ...currentProject, description: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm min-h-[120px] resize-y"
                  placeholder="Project overview..."
                />
              </div>
              <div className="space-y-2 md:col-span-2 p-6 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Project Image</h3>
                <ImageUpload
                  label=""
                  initialValue={currentProject.image}
                  onUploadComplete={(url) => setCurrentProject({ ...currentProject, image: url })}
                  folder="projects"
                  cropShape="rect"
                  aspectRatio={16/9}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Project Link</label>
                <input
                  value={currentProject.link || ''}
                  onChange={e => setCurrentProject({ ...currentProject, link: e.target.value })}
                   className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Role</label>
                <input
                  value={currentProject.role || ''}
                  onChange={e => setCurrentProject({ ...currentProject, role: e.target.value })}
                   className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm"
                  placeholder="e.g. Lead Architect"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Result</label>
                <input
                  value={currentProject.result || ''}
                  onChange={e => setCurrentProject({ ...currentProject, result: e.target.value })}
                   className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm"
                  placeholder="e.g. 30% growth"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tech Stack (comma separated)</label>
                <input
                  value={currentProject.techStack?.join(', ') || ''}
                  onChange={e => setCurrentProject({ ...currentProject, techStack: e.target.value.split(',').map(s => s.trim()) })}
                   className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all shadow-sm"
                  placeholder="React, Firebase, Tailwind..."
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
                  Save Project
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
            <div key={i} className="h-[400px] bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-3xl border border-slate-200 dark:border-white/10" />
          ))
        ) : projects.length === 0 ? (
          <div className="md:col-span-3 py-20 text-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Briefcase size={32} className="text-brand opacity-80" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">No projects found</p>
            <p className="text-slate-500 dark:text-slate-400">Click "Add Project" to build your portfolio.</p>
          </div>
        ) : (
          projects.map((project, i) => (
             <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={project.id}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden hover:border-brand/40 hover:shadow-2xl transition-all shadow-sm flex flex-col relative"
            >
              <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 relative overflow-hidden shrink-0">
                {project.image ? (
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                    <Briefcase size={48} />
                  </div>
                )}
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300 z-10">
                  <button
                    onClick={() => openEdit(project)}
                    className="p-2.5 bg-white text-slate-700 hover:text-brand hover:scale-110 rounded-xl shadow-lg transition-all"
                    title="Edit project"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2.5 bg-white text-red-500 hover:scale-110 rounded-xl shadow-lg transition-all"
                    title="Delete project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                 {project.link && (
                    <a href={project.link} target="_blank" rel="noreferrer" className="absolute bottom-4 right-4 w-10 h-10 bg-brand text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 translate-y-[10px] group-hover:translate-y-0 z-10">
                      <ExternalLink size={18} />
                    </a>
                  )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-100 dark:border-white/5">
                    {project.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-brand transition-colors line-clamp-1">{project.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4 flex-1 font-medium">{project.description}</p>
                
                 {project.techStack && project.techStack.length > 0 && (
                  <div className="flex gap-2 flex-wrap pt-4 border-t border-slate-100 dark:border-white/5">
                    {project.techStack.slice(0, 3).map((tech, idx) => (
                      <span key={idx} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tech}</span>
                    ))}
                    {project.techStack.length > 3 && (
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">+{project.techStack.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
