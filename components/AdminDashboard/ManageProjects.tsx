
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-theme-card border border-theme-border rounded-2xl p-8 shadow-xl"
          >
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text">Project Title</label>
                <input
                  required
                  value={currentProject.title || ''}
                  onChange={e => setCurrentProject({ ...currentProject, title: e.target.value })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
                  placeholder="e.g. AI Branding Tool"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text">Category</label>
                <input
                  required
                  value={currentProject.category || ''}
                  onChange={e => setCurrentProject({ ...currentProject, category: e.target.value })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
                  placeholder="e.g. Automation"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-theme-text">Description</label>
                <textarea
                  required
                  value={currentProject.description || ''}
                  onChange={e => setCurrentProject({ ...currentProject, description: e.target.value })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text min-h-[100px]"
                  placeholder="Project overview..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <ImageUpload
                  label="Project Image"
                  initialValue={currentProject.image}
                  onUploadComplete={(url) => setCurrentProject({ ...currentProject, image: url })}
                  folder="projects"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text">Project Link</label>
                <input
                  value={currentProject.link || ''}
                  onChange={e => setCurrentProject({ ...currentProject, link: e.target.value })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text">Role</label>
                <input
                  value={currentProject.role || ''}
                  onChange={e => setCurrentProject({ ...currentProject, role: e.target.value })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
                  placeholder="e.g. Lead Architect"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text">Result</label>
                <input
                  value={currentProject.result || ''}
                  onChange={e => setCurrentProject({ ...currentProject, result: e.target.value })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
                  placeholder="e.g. 30% growth"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-theme-text">Tech Stack (comma separated)</label>
                <input
                  value={currentProject.techStack?.join(', ') || ''}
                  onChange={e => setCurrentProject({ ...currentProject, techStack: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl outline-none focus:ring-2 focus:ring-brand text-theme-text"
                  placeholder="React, Firebase, Tailwind..."
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
                  Save Project
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-theme-card animate-pulse rounded-2xl border border-theme-border" />
          ))
        ) : projects.length === 0 ? (
          <div className="md:col-span-2 py-20 text-center bg-theme-card rounded-2xl border border-dashed border-theme-border">
            <p className="text-theme-dim">No projects found. Add your first project!</p>
          </div>
        ) : (
          projects.map((project) => (
            <motion.div
              layout
              key={project.id}
              className="bg-theme-card border border-theme-border rounded-2xl overflow-hidden group hover:border-brand/50 transition-all"
            >
              <div className="aspect-video bg-theme-bg relative overflow-hidden">
                {project.image ? (
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-theme-dim">
                    <Briefcase size={48} />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => openEdit(project)}
                    className="p-2 bg-white/90 backdrop-blur text-blue-600 rounded-lg shadow-lg hover:bg-white transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 bg-white/90 backdrop-blur text-red-600 rounded-lg shadow-lg hover:bg-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-brand uppercase tracking-wider">{project.category}</span>
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noreferrer" className="text-theme-dim hover:text-brand">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
                <h3 className="text-xl font-bold text-theme-text mb-2">{project.title}</h3>
                <p className="text-theme-dim text-sm line-clamp-2">{project.description}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
