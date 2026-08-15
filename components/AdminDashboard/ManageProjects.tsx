
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
import { getGithubToken, fetchUserRepos } from '../../utils/githubService';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

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
        await addDoc(collection(db, 'projects'), {
          ...currentProject,
          id: Date.now().toString() // Use timestamp as a temporary ID if needed
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
    setTimeout(() => document.getElementById('admin-main-content')?.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  const handleGithubImport = async () => {
    if (!githubRepoUrl) return;
    setIsImporting(true);
    try {
      let repoPath = githubRepoUrl.replace('https://github.com/', '').replace('http://github.com/', '');
      if (repoPath.endsWith('/')) repoPath = repoPath.slice(0, -1);
      
      const token = getGithubToken();
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `token ${token}`;
      }

      const response = await fetch(`https://api.github.com/repos/${repoPath}`, { headers });
      if (!response.ok) throw new Error(`Could not fetch repo data. (HTTP ${response.status}) Please check the URL and your GitHub token.`);
      const data = await response.json();
      
      let readme = '';
      try {
        // use api.github.com for readme as raw.githubusercontent.com token handling is tricky
        const readmeRes = await fetch(`https://api.github.com/repos/${repoPath}/readme`, { headers });
        if (readmeRes.ok) {
           const readmeData = await readmeRes.json();
           readme = decodeURIComponent(escape(atob(readmeData.content)));
        }
      } catch (e) {}
      
      const combinedData = JSON.stringify({
        name: data.name,
        description: data.description,
        language: data.language,
        topics: data.topics,
        readme: readme.substring(0, 4000) 
      });

      const generated = await generateProjectFromGithub(combinedData);
      
      setCurrentProject(prev => ({
        ...prev,
        title: generated.title || data.name,
        description: generated.description || data.description,
        longDescription: generated.longDescription || readme,
        category: generated.category || 'Other',
        techStack: generated.techStack ? generated.techStack.split(',').map((s: string) => s.trim()) : (data.topics || []),
        features: generated.features ? generated.features.split(',').map((s: string) => s.trim()) : [],
        privacyPolicy: generated.privacyPolicy || '',
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
    }
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
            setGithubRepoUrl('');
            setIsEditing(true);
            setTimeout(() => document.getElementById('admin-main-content')?.scrollTo({ top: 0, behavior: 'smooth' }), 100);
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
            <div className="bg-surface border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
             {/* Subtle background glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-3xl rounded-full pointer-events-none" />
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors z-10"
                title="Close"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold text-on-surface mb-8 relative z-10">
                {currentProject.id ? 'Edit Project' : 'Add New Project'}
              </h2>

              <div className="mb-6 space-y-2 md:col-span-2 bg-gradient-to-r from-brand/5 to-purple-500/5 p-5 rounded-3xl border border-brand/20 relative z-10">
                  <label className="text-sm font-bold text-brand flex items-center gap-2">
                    <Sparkles size={16} />
                    AI Magic: Generate from GitHub
                  </label>
                  <p className="text-xs text-on-surface-variant mb-2">Paste a GitHub repository link and AI will automatically analyze the code and write a highly detailed project description for you.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      {githubRepos.length > 0 ? (
                        <select
                          value={githubRepoUrl}
                          onChange={e => {
                            setGithubRepoUrl(e.target.value);
                            setCurrentProject(prev => ({ ...prev, githubUrl: e.target.value }));
                          }}
                          className="w-full text-base pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface shadow-sm appearance-none cursor-pointer"
                        >
                          <option value="">Select a repository...</option>
                          {githubRepos.map(repo => (
                            <option key={repo.url} value={repo.url}>{repo.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={githubRepoUrl}
                          onChange={e => {
                            setGithubRepoUrl(e.target.value);
                            setCurrentProject(prev => ({ ...prev, githubUrl: e.target.value }));
                          }}
                          placeholder="https://github.com/username/repo"
                          className="w-full text-base pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface shadow-sm"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleGithubImport}
                      disabled={isImporting || !githubRepoUrl}
                      className="bg-brand text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-brand-700 transition-colors disabled:opacity-50 shrink-0 shadow-lg shadow-brand/20"
                    >
                      {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      Analyze Code
                    </button>
                  </div>
                </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant">Project Title</label>
                <textarea
                  required
                  rows={2}
                  value={currentProject.title || ''}
                  onChange={e => setCurrentProject({ ...currentProject, title: e.target.value })}
                  className="w-full text-base px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm resize-none"
                  placeholder="e.g. AI Branding Tool"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant">Description</label>
                <textarea
                  required
                  value={currentProject.description || ''}
                  onChange={e => setCurrentProject({ ...currentProject, description: e.target.value })}
                  className="w-full text-base px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm min-h-[120px] resize-y"
                  placeholder="Project overview..."
                />
              </div>
              <div className="space-y-2 md:col-span-2 p-6 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border border-outline-variant shadow-sm">
                <h3 className="font-bold text-on-surface mb-4">Project Image</h3>
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
                <label className="text-sm font-bold text-on-surface-variant">Project Link</label>
                <input
                  value={currentProject.link || ''}
                  onChange={e => setCurrentProject({ ...currentProject, link: e.target.value })}
                   className="w-full text-base px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant flex items-center justify-between">
                  <span>Mobile App Link (Google Drive)</span>
                  <span className="text-[10px] font-normal text-text-secondary bg-surface-variant px-1.5 py-0.5 rounded uppercase tracking-wider">Optional</span>
                </label>
                <input
                  value={currentProject.appLink || ''}
                  onChange={e => setCurrentProject({ ...currentProject, appLink: e.target.value })}
                  className="w-full text-base px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant flex items-center justify-between">
                  <span>App Version</span>
                  <span className="text-[10px] font-normal text-text-secondary bg-surface-variant px-1.5 py-0.5 rounded uppercase tracking-wider">Optional</span>
                </label>
                <input
                  value={currentProject.appVersion || ''}
                  onChange={e => setCurrentProject({ ...currentProject, appVersion: e.target.value })}
                  className="w-full text-base px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                  placeholder="e.g. v1.0.2"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant">Tech Stack (comma separated)</label>
                <input
                  value={currentProject.techStack?.join(', ') || ''}
                  onChange={e => setCurrentProject({ ...currentProject, techStack: e.target.value.split(',').map(s => s.trim()) })}
                   className="w-full text-base px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                  placeholder="React, Firebase, Tailwind..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Category</label>
                  <input
                    value={currentProject.category || ''}
                    onChange={e => setCurrentProject({ ...currentProject, category: e.target.value })}
                    className="w-full text-base px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                    placeholder="e.g. Full-Stack, Frontend..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Role</label>
                  <input
                    value={currentProject.role || ''}
                    onChange={e => setCurrentProject({ ...currentProject, role: e.target.value })}
                    className="w-full text-base px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                    placeholder="e.g. Lead Developer"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant">Core Features (comma separated)</label>
                <input
                  value={currentProject.features?.join(', ') || ''}
                  onChange={e => setCurrentProject({ ...currentProject, features: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full text-base px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                  placeholder="Real-time chat, Auth, Payments..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant">Case Study (Long Description)</label>
                <div className="bg-white dark:bg-slate-900 text-on-surface rounded-xl overflow-hidden border border-outline-variant">
                  <ReactQuill 
                    theme="snow"
                    value={currentProject.longDescription || ''}
                    onChange={(value) => setCurrentProject(prev => ({ ...prev, longDescription: value }))}
                    className="h-[250px] mb-12"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant">The Outcome (Result)</label>
                <textarea
                  value={currentProject.result || ''}
                  onChange={e => setCurrentProject({ ...currentProject, result: e.target.value })}
                  className="w-full text-base px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm min-h-[100px] resize-y"
                  placeholder="e.g. Increased user retention by 20%..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-on-surface-variant flex justify-between items-center">
                  <span>Privacy Policy</span>
                  <span className="text-[10px] font-normal text-text-secondary bg-surface-variant px-1.5 py-0.5 rounded uppercase tracking-wider">Optional</span>
                </label>
                <div className="bg-white dark:bg-slate-900 text-on-surface rounded-xl overflow-hidden border border-outline-variant">
                  <ReactQuill 
                    theme="snow"
                    value={currentProject.privacyPolicy || ''}
                    onChange={(value) => setCurrentProject(prev => ({ ...prev, privacyPolicy: value }))}
                    className="h-[200px] mb-12"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-4 pt-6 border-t border-outline-variant mt-2">
                <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                  <Sparkles size={18} className="text-brand" /> 
                  SEO Metadata (Auto-generated)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface-variant">SEO Title</label>
                    <input
                      value={currentProject.seoTitle || ''}
                      onChange={e => setCurrentProject({ ...currentProject, seoTitle: e.target.value })}
                      className="w-full text-sm px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                      placeholder="Optimized title..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface-variant">Keywords</label>
                    <input
                      value={currentProject.keywords || ''}
                      onChange={e => setCurrentProject({ ...currentProject, keywords: e.target.value })}
                      className="w-full text-sm px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all shadow-sm"
                      placeholder="react, web dev, etc..."
                    />
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <label className="text-sm font-bold text-on-surface-variant">Meta Description</label>
                  <textarea
                    rows={2}
                    value={currentProject.metaDescription || ''}
                    onChange={e => setCurrentProject({ ...currentProject, metaDescription: e.target.value })}
                    className="w-full text-sm px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-brand text-on-surface transition-all resize-none shadow-sm"
                    placeholder="Brief description for search engines..."
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-6 pt-6 border-t border-outline-variant">
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
                  Save Project
                </button>
              </div>
            </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!isConfigured ? (
          <div className="md:col-span-3 py-20 text-center bg-red-50 dark:bg-red-900/10 rounded-3xl border border-dashed border-red-200 dark:border-red-500/20 shadow-sm">
             <p className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Firebase Not Configured</p>
             <p className="text-on-surface-variant">Please check your .env file or firebase.ts configuration.</p>
          </div>
        ) : loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[400px] bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-3xl border border-outline-variant" />
          ))
        ) : projects.length === 0 ? (
          <div className="md:col-span-3 py-20 text-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Briefcase size={32} className="text-brand opacity-80" />
            </div>
            <p className="text-xl font-bold text-on-surface mb-2">No projects found</p>
            <p className="text-on-surface-variant">Click "Add Project" to build your portfolio.</p>
          </div>
        ) : (
          projects.map((project, i) => (
             <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={project.id}
              className="group bg-surface border border-outline-variant rounded-3xl overflow-hidden hover:border-brand/40 hover:shadow-2xl transition-all shadow-sm flex flex-col relative"
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
                    className="p-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand dark:hover:text-brand hover:scale-110 rounded-xl shadow-lg transition-all"
                    title="Edit project"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2.5 bg-white dark:bg-slate-800 text-red-500 hover:text-red-400 hover:scale-110 rounded-xl shadow-lg transition-all"
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

                <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-brand transition-colors line-clamp-1">{project.title}</h3>
                <p className="text-on-surface-variant text-sm line-clamp-2 mb-4 flex-1 font-medium">{project.description}</p>
                
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
