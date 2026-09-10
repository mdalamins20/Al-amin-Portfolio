
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
import { Project } from '../../types';
import { Plus, Trash2, Edit2, ExternalLink, Save, X, Loader2, Briefcase, Sparkles, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUpload } from './ImageUpload';
import { ConfirmationModal } from './ConfirmationModal';
import { generateProjectFromGithub } from '../../utils/aiService';
import { compileAndSyncToGist } from '../../utils/syncService';
import { getGithubToken, fetchUserRepos, fetchGithubRepoData } from '../../utils/githubService';

export const ManageProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});
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
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [scanProgress, setScanProgress] = useState<{isOpen: boolean, messages: string[]}>({ isOpen: false, messages: [] });

  const [githubRepos, setGithubRepos] = useState<{name: string, url: string}[]>([]);

  useEffect(() => {
    fetchProjects();
    fetchUserRepos().then(repos => setGithubRepos(repos));
  }, []);

  const fetchProjects = async () => {
    if (!isConfigured || !db) {
      setLoading(false);
      return;
    }
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
    if (!db) return;
    setFormLoading(true);
    try {
      if (currentProject.id) {
        const { id, ...data } = currentProject;
        await updateDoc(doc(db, 'projects', id), data);
      } else {
        const { id, ...projectData } = currentProject;
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          id: Date.now().toString()
        });
      }
      setIsEditing(false);
      setCurrentProject({});
      fetchProjects();
      
      // Background Sync to Gist
      compileAndSyncToGist().catch(console.error);
      
      setModalConfig({
        isOpen: true,
        title: 'Success!',
        message: 'Project has been saved successfully.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving project:', error);
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: 'Failed to save project. Please try again.',
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
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'projects', id));
          fetchProjects();
          // Background Sync to Gist
          compileAndSyncToGist().catch(console.error);
        } catch (error) {
          console.error('Error deleting project:', error);
        }
      }
    });
  };

  const openEdit = (project: Project) => {
    setCurrentProject(project);
    setGithubRepoUrl(project.githubUrl || '');
    setIsEditing(true);
  };

  const handleGithubImport = async () => {
    if (!githubRepoUrl) return;
    setIsImporting(true);
    setScanProgress({ isOpen: true, messages: ['Initializing AI Scanner...'] });
    
    try {
      const combinedData = await fetchGithubRepoData(githubRepoUrl, (msg) => {
        setScanProgress(prev => ({ ...prev, messages: [...prev.messages, msg] }));
      });
      
      const generated = await generateProjectFromGithub(combinedData);
      
      setCurrentProject(prev => ({
        ...prev,
        title: generated.title || '',
        description: generated.description || '',
        techStack: generated.techStack ? generated.techStack.split(',').map((s: string) => s.trim()) : [],
        seoTitle: generated.seoTitle || '',
        metaDescription: generated.metaDescription || '',
        keywords: generated.keywords || '',
        githubUrl: githubRepoUrl,
        link: prev.link || '' // keep existing live link, don't overwrite it with github URL
      }));
    } catch (err: any) {
      setModalConfig({
        isOpen: true,
        title: 'Import Failed',
        message: err.message || 'Failed to import from GitHub.',
        type: 'danger'
      });
    } finally {
      setIsImporting(false);
      setScanProgress({ isOpen: false, messages: [] });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Briefcase size={20} className="text-blue-500" />
            </div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight">Manage Projects</h1>
          </div>
          <p className="text-text-secondary text-sm mt-1 font-medium pl-[52px]">Add, update or remove portfolio showcase projects</p>
        </div>
        <button
          onClick={() => {
            setCurrentProject({});
            setGithubRepoUrl('');
            setIsEditing(true);
            fetchUserRepos().then(repos => setGithubRepos(repos));
          }}
          className="bg-primary text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95"
        >
          <Plus size={20} />
          Add Project
        </button>
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md z-0"
              onClick={() => setIsEditing(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-surface/95 dark:bg-slate-950/90 backdrop-blur-2xl border border-surface-variant/30 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl z-10"
            >
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
                {currentProject.id ? 'Edit Project' : 'Add New Project'}
              </h2>

              <div className="mb-6 space-y-2 md:col-span-2 bg-primary/5 p-5 rounded-2xl border border-primary/20 relative z-10">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Sparkles size={16} />
                    AI Magic: Generate from GitHub
                  </label>
                  <p className="text-xs text-text-secondary mb-2">Paste a GitHub repository link and AI will automatically analyze the code and write a highly detailed project description for you.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                      {githubRepos.length > 0 ? (
                        <select
                          value={githubRepoUrl}
                          onChange={e => {
                            setGithubRepoUrl(e.target.value);
                            setCurrentProject(prev => ({ ...prev, githubUrl: e.target.value }));
                          }}
                          className="w-full text-sm pl-11 pr-4 py-3 bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary text-on-surface shadow-sm appearance-none cursor-pointer font-medium"
                        >
                          <option value="">Select a repository...</option>
                          {githubRepos.map(repo => {
                            const isAdded = projects.some(p => p.githubUrl === repo.url);
                            return (
                              <option key={repo.url} value={repo.url} disabled={isAdded}>
                                {repo.name} {isAdded ? '(Already Added)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <input
                          value={githubRepoUrl}
                          onChange={e => {
                            setGithubRepoUrl(e.target.value);
                            setCurrentProject(prev => ({ ...prev, githubUrl: e.target.value }));
                          }}
                          placeholder="https://github.com/username/repo"
                          className="w-full text-sm pl-11 pr-4 py-3 bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary text-on-surface shadow-sm font-medium"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleGithubImport}
                      disabled={isImporting || !githubRepoUrl}
                      className="bg-primary text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shrink-0 shadow-lg shadow-primary/25 text-sm"
                    >
                      {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      Analyze Code
                    </button>
                  </div>
                </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Project Title</label>
                <textarea
                  required
                  rows={1}
                  value={currentProject.title || ''}
                  onChange={e => setCurrentProject({ ...currentProject, title: e.target.value })}
                  className="w-full text-base px-4 py-3 bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary text-on-surface transition-all shadow-sm resize-none font-bold"
                  placeholder="e.g. AI Branding Tool"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Description</label>
                <textarea
                  required
                  value={currentProject.description || ''}
                  onChange={e => setCurrentProject({ ...currentProject, description: e.target.value })}
                  className="w-full text-sm px-4 py-3 bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary text-on-surface transition-all shadow-sm min-h-[110px] resize-y leading-relaxed font-medium"
                  placeholder="Project overview and impact..."
                />
              </div>
              <div className="space-y-2 md:col-span-2 p-5 bg-surface-variant/10 dark:bg-white/5 rounded-3xl border border-surface-variant/30 dark:border-white/10 shadow-sm">
                <h3 className="font-bold text-sm text-on-surface mb-3">Project Image (16:9 recommended)</h3>
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
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Live Project Link</label>
                <input
                  value={currentProject.link || ''}
                  onChange={e => setCurrentProject({ ...currentProject, link: e.target.value })}
                  className="w-full text-sm px-4 py-3 bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary text-on-surface transition-all shadow-sm font-medium"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center justify-between">
                  <span>Mobile App Link (Optional)</span>
                  <span className="text-[10px] text-text-secondary bg-surface-variant/30 px-1.5 py-0.5 rounded">APK</span>
                </label>
                <input
                  value={currentProject.appLink || ''}
                  onChange={e => setCurrentProject({ ...currentProject, appLink: e.target.value })}
                  className="w-full text-sm px-4 py-3 bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary text-on-surface transition-all shadow-sm font-medium"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center justify-between">
                  <span>App Version (Optional)</span>
                </label>
                <input
                  value={currentProject.appVersion || ''}
                  onChange={e => setCurrentProject({ ...currentProject, appVersion: e.target.value })}
                  className="w-full text-sm px-4 py-3 bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary text-on-surface transition-all shadow-sm font-medium"
                  placeholder="e.g. v1.0.2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Tech Stack (comma separated)</label>
                <input
                  value={currentProject.techStack?.join(', ') || ''}
                  onChange={e => setCurrentProject({ ...currentProject, techStack: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full text-sm px-4 py-3 bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary text-on-surface transition-all shadow-sm font-medium"
                  placeholder="React, Tailwind, Firebase..."
                />
              </div>

              <div className="md:col-span-2 space-y-4 pt-5 border-t border-surface-variant/20 dark:border-white/5 mt-2">
                <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" /> 
                  SEO Metadata (Auto-generated)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">SEO Title</label>
                    <input
                      value={currentProject.seoTitle || ''}
                      onChange={e => setCurrentProject({ ...currentProject, seoTitle: e.target.value })}
                      className="w-full text-sm px-4 py-2.5 bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary text-on-surface transition-all shadow-sm"
                      placeholder="Optimized title..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Keywords</label>
                    <input
                      value={currentProject.keywords || ''}
                      onChange={e => setCurrentProject({ ...currentProject, keywords: e.target.value })}
                      className="w-full text-sm px-4 py-2.5 bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary text-on-surface transition-all shadow-sm"
                      placeholder="react, web dev, etc..."
                    />
                  </div>
                </div>
                <div className="space-y-2 mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Meta Description</label>
                  <textarea
                    rows={2}
                    value={currentProject.metaDescription || ''}
                    onChange={e => setCurrentProject({ ...currentProject, metaDescription: e.target.value })}
                    className="w-full text-sm px-4 py-2.5 bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary text-on-surface transition-all resize-none shadow-sm font-medium"
                    placeholder="Brief description for search engines..."
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-5 border-t border-surface-variant/20 dark:border-white/5">
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
                  Save Project
                </button>
              </div>
            </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!isConfigured ? (
          <div className="md:col-span-3 py-20 text-center bg-red-500/10 rounded-3xl border border-dashed border-red-500/20 shadow-sm">
             <p className="text-xl font-bold text-red-500 mb-2">Firebase Not Configured</p>
             <p className="text-text-secondary text-sm">Please check your .env file or firebase.ts configuration.</p>
          </div>
        ) : loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[380px] bg-surface-variant/15 dark:bg-white/5 animate-pulse rounded-3xl border border-surface-variant/30 dark:border-white/5" />
          ))
        ) : projects.length === 0 ? (
          <div className="md:col-span-3 py-20 text-center bg-surface-variant/10 dark:bg-white/5 rounded-3xl border border-dashed border-surface-variant/40 dark:border-white/10 shadow-sm">
            <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-surface-variant/30">
              <Briefcase size={28} className="text-primary opacity-80" />
            </div>
            <p className="text-lg font-bold text-on-surface mb-1">No projects found</p>
            <p className="text-text-secondary text-xs">Click "Add Project" to build your portfolio showcase.</p>
          </div>
        ) : (
          projects.map((project, i) => (
             <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={project.id}
              className="group bg-surface/90 dark:bg-slate-950/70 backdrop-blur-xl border border-surface-variant/30 dark:border-white/10 rounded-3xl overflow-hidden hover:border-primary/40 hover:shadow-2xl transition-all shadow-sm flex flex-col relative"
            >
              <div className="aspect-[16/10] bg-surface-variant/20 dark:bg-slate-900 relative overflow-hidden shrink-0">
                {project.image ? (
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-secondary">
                    <Briefcase size={40} />
                  </div>
                )}
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-[-6px] group-hover:translate-y-0 transition-all duration-300 z-10">
                  <button
                    onClick={() => openEdit(project)}
                    className="p-2.5 bg-surface/90 backdrop-blur-md text-on-surface hover:text-primary hover:scale-110 rounded-xl shadow-lg border border-surface-variant/30 transition-all"
                    title="Edit project"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2.5 bg-surface/90 backdrop-blur-md text-red-500 hover:text-red-400 hover:scale-110 rounded-xl shadow-lg border border-surface-variant/30 transition-all"
                    title="Delete project"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                 {project.link && (
                    <a href={project.link} target="_blank" rel="noreferrer" className="absolute bottom-4 right-4 w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 translate-y-[6px] group-hover:translate-y-0 z-10">
                      <ExternalLink size={16} />
                    </a>
                  )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-1">{project.title}</h3>
                <p className="text-text-secondary text-xs line-clamp-2 mb-4 flex-1 font-medium leading-relaxed">{project.description}</p>
                
                 {project.techStack && project.techStack.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap pt-4 border-t border-surface-variant/20 dark:border-white/5">
                    {project.techStack.slice(0, 3).map((tech, idx) => (
                      <span key={idx} className="text-[10px] font-bold text-text-secondary bg-surface-variant/20 dark:bg-white/5 px-2 py-0.5 rounded-md uppercase tracking-wider">{tech}</span>
                    ))}
                    {project.techStack.length > 3 && (
                       <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-wider">+{project.techStack.length - 3}</span>
                    )}
                  </div>
                )}
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

      <AnimatePresence>
        {scanProgress.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-surface/95 dark:bg-slate-950/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-surface-variant/30 dark:border-white/10 p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3 text-on-surface border-b border-surface-variant/20 dark:border-white/5 pb-4">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <h3 className="text-base font-bold">AI Code Scanner Running...</h3>
              </div>
              <div className="flex flex-col gap-2.5 min-h-[200px] max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {scanProgress.messages.map((msg, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={idx}
                    className="flex items-start gap-2 text-xs text-text-secondary font-mono"
                  >
                    <span className="text-primary mt-0.5">❯</span>
                    <span>{msg}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
