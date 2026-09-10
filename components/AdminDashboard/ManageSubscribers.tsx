import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, Users, History, Calendar, Link as LinkIcon, RefreshCw, Trash2, CheckSquare, Square } from 'lucide-react';
import { db, isConfigured } from '../../firebase';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { showAlert, useDialogStore } from '../stores/useDialogStore';
import { getEmailJSKeys, hasEmailJSKeys } from '../../utils/emailjsService';
import { Blog, Project } from '../../types';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: any;
  source: string;
}

interface BroadcastHistory {
  id: string;
  subject: string;
  recipientCount: number;
  sentAt: any;
  status: string;
}

export const ManageSubscribers: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [history, setHistory] = useState<BroadcastHistory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { showDialog } = useDialogStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // For Broadcast Modal
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!isConfigured || !db) return;
    setLoading(true);
    try {
      // Fetch Subscribers
      const subQ = query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc'));
      const subSnap = await getDocs(subQ);
      setSubscribers(subSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Subscriber[]);

      // Fetch History
      const histQ = query(collection(db, 'broadcast_history'), orderBy('sentAt', 'desc'));
      const histSnap = await getDocs(histQ);
      setHistory(histSnap.docs.map(d => ({ id: d.id, ...d.data() })) as BroadcastHistory[]);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    if (!db) return;
    try {
      const bQ = query(collection(db, 'blogs'), orderBy('date', 'desc'));
      const bSnap = await getDocs(bQ);
      setBlogs(bSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Blog[]);

      const pQ = query(collection(db, 'projects'));
      const pSnap = await getDocs(pQ);
      setProjects(pSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Project[]);
    } catch (e) {
      console.error(e);
    }
  };

  const openBroadcastModal = () => {
    if (!hasEmailJSKeys()) {
      showAlert("Missing Keys", "Please configure your EmailJS keys in the API Settings first.", "danger");
      return;
    }
    if (subscribers.length === 0) {
      showAlert("No Subscribers", "You don't have any subscribers to send emails to yet.", "danger");
      return;
    }
    fetchOptions();
    setSelectedSubscribers(subscribers.map(s => s.id));
    setIsModalOpen(true);
  };

  const handleDeleteSubscriber = async (id: string, email: string) => {
    const confirmed = await showDialog({
      title: 'Delete Subscriber',
      message: `Are you sure you want to remove ${email} from your subscriber list?`,
      type: 'confirm',
      variant: 'danger',
      confirmText: 'Delete'
    });
    
    if (confirmed) {
      try {
        await deleteDoc(doc(db, 'subscribers', id));
        fetchData();
        showAlert("Success", "Subscriber removed.", "success");
      } catch (e) {
        console.error(e);
        showAlert("Error", "Could not delete subscriber.", "danger");
      }
    }
  };

  const handleBroadcast = async () => {
    if (selectedItems.length === 0) {
      showAlert("Error", "Please select at least one item to broadcast.", "danger");
      return;
    }
    
    if (selectedSubscribers.length === 0) {
      showAlert("Error", "Please select at least one recipient.", "danger");
      return;
    }

    const keys = getEmailJSKeys();
    
    // Generate HTML for selected items
    let itemsHtml = '';
    selectedItems.forEach(id => {
      let b = blogs.find(x => x.id === id);
      let p = projects.find(x => x.id === id);
      
      let title = b ? b.title : (p ? p.title : '');
      let url = b ? `${window.location.origin}/blog/${b.id}` : (p ? `${window.location.origin}/project/${p.id}` : '');
      
      if (title && url) {
        itemsHtml += `
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 25px; margin-bottom: 20px;">
            <tr>
              <td>
                <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: bold; color: #333333;">
                  ${title}
                </h2>
                <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #10B981; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 6px; margin-top: 10px;">
                  View Detail
                </a>
              </td>
            </tr>
          </table>
        `;
      }
    });

    // Dark mode styles for EmailJS injected via inline styles is hard, 
    // so we just rely on the template's overall theme and keep the card light or transparent.
    // In our new template, the .card class handles dark mode, so we can use classes!
    
    let styledItemsHtml = '';
    selectedItems.forEach(id => {
      let b = blogs.find(x => x.id === id);
      let p = projects.find(x => x.id === id);
      let title = b ? b.title : (p ? p.title : '');
      let url = b ? `${window.location.origin}/blog/${b.id}` : (p ? `${window.location.origin}/project/${p.id}` : '');
      
      if (title && url) {
        styledItemsHtml += `
          <table class="card" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius: 8px; padding: 25px; margin-bottom: 20px;">
            <tr>
              <td>
                <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: bold;">
                  ${title}
                </h2>
                <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 15px; border-radius: 6px; margin-top: 10px;">
                  Read More
                </a>
              </td>
            </tr>
          </table>
        `;
      }
    });

    const subject = customSubject || `New Updates from Al-amin!`;
    const message = customMessage || `Hey there! I just published some exciting new updates. I'd love for you to check them out and share your thoughts!`;

    setIsSending(true);
    let successCount = 0;

    try {
      // EmailJS REST API
      const url = 'https://api.emailjs.com/api/v1.0/email/send';
      
      const targetSubscribers = subscribers.filter(s => selectedSubscribers.includes(s.id));
      
      const promises = targetSubscribers.map(sub => {
        return fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: keys.serviceId,
            template_id: keys.templateId,
            user_id: keys.publicKey,
            template_params: {
              to_email: sub.email,
              subject: subject,
              message: message,
              items_html: styledItemsHtml
            }
          })
        }).then(res => {
          if(res.ok) successCount++;
        }).catch(err => console.error("Failed to send to", sub.email, err));
      });

      await Promise.all(promises);

      // Log history (silently fail if rules are not deployed yet)
      if (db) {
        try {
          await addDoc(collection(db, 'broadcast_history'), {
            subject,
            recipientCount: successCount,
            sentAt: serverTimestamp(),
            status: successCount === targetSubscribers.length ? 'Success' : 'Partial Success'
          });
        } catch (historyErr) {
          console.warn("Could not save history to Firestore. Please update your Firestore Rules.", historyErr);
        }
      }

      setIsModalOpen(false);
      fetchData(); // Refresh history
      showAlert("Broadcast Complete", `Successfully sent emails to ${successCount} out of ${targetSubscribers.length} recipients.`, "success");

    } catch (e: any) {
      console.error(e);
      showAlert("Error", "A critical error occurred while sending emails.", "danger");
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return '';
    if (ts.toDate) return ts.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return '';
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Mail size={20} className="text-purple-500" />
            </div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight">Newsletter & Subscribers</h1>
          </div>
          <p className="text-text-secondary text-sm font-medium pl-[52px]">Manage your audience and send manual updates.</p>
        </div>
        <button
          onClick={openBroadcastModal}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:scale-[1.02] active:scale-[0.98] text-white rounded-2xl font-bold transition-all hover:shadow-lg hover:shadow-primary/20"
        >
          <Send size={18} /> Broadcast Email
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="animate-spin text-brand" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscribers List */}
          <div className="bg-surface rounded-3xl p-6 shadow-sm border border-outline-variant">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">Subscribers</h2>
                <p className="text-sm text-on-surface-variant">Total: {subscribers.length}</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {subscribers.length === 0 ? (
                <div className="text-center py-10 text-on-surface-variant">No subscribers yet.</div>
              ) : (
                subscribers.map((sub, i) => (
                  <div key={sub.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-outline-variant">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-sm">{sub.email}</p>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                          <Calendar size={10} /> {formatDate(sub.subscribedAt)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove Subscriber"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Broadcast History */}
          <div className="bg-surface rounded-3xl p-6 shadow-sm border border-outline-variant">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                <History size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">Broadcast History</h2>
                <p className="text-sm text-on-surface-variant">Total Sent: {history.length}</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center py-10 text-on-surface-variant">No broadcasts sent yet.</div>
              ) : (
                history.map(hist => (
                  <div key={hist.id} className="flex flex-col gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-outline-variant">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-on-surface text-sm">{hist.subject}</p>
                      <span className="text-[10px] font-bold px-2 py-1 bg-green-500/10 text-green-500 rounded-md uppercase">
                        {hist.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1"><Users size={12} /> {hist.recipientCount} Recipients</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(hist.sentAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isSending && setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-surface rounded-3xl p-6 md:p-8 shadow-2xl border border-outline-variant overflow-hidden max-h-[90vh] flex flex-col"
            >
              <h2 className="text-2xl font-bold text-on-surface mb-6 shrink-0">New Broadcast</h2>
              
              <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                
                {/* Select Recipients */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-on-surface-variant block">Select Recipients</label>
                    <button 
                      onClick={() => setSelectedSubscribers(selectedSubscribers.length === subscribers.length ? [] : subscribers.map(s => s.id))}
                      className="text-xs text-brand font-bold bg-brand/10 px-3 py-1 rounded-full hover:bg-brand/20 transition-colors"
                    >
                      {selectedSubscribers.length === subscribers.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar border border-outline-variant rounded-xl p-3 bg-slate-50 dark:bg-slate-800/30 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {subscribers.map(s => (
                      <label key={s.id} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="relative flex items-center justify-center shrink-0">
                          <input 
                            type="checkbox" 
                            checked={selectedSubscribers.includes(s.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedSubscribers([...selectedSubscribers, s.id]);
                              else setSelectedSubscribers(selectedSubscribers.filter(id => id !== s.id));
                            }}
                            className="peer opacity-0 absolute w-full h-full cursor-pointer"
                          />
                          <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 rounded peer-checked:bg-brand peer-checked:border-brand flex items-center justify-center text-white transition-colors">
                            <CheckSquare size={12} className="opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-on-surface line-clamp-1 group-hover:text-brand transition-colors">{s.email}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Select Blogs */}
                  <div>
                    <label className="text-sm font-bold text-on-surface-variant block mb-3">Select Blogs</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar border border-outline-variant rounded-xl p-3 bg-slate-50 dark:bg-slate-800/30">
                      {blogs.map(b => (
                        <label key={b.id} className="flex items-start gap-3 cursor-pointer group">
                          <div className="mt-0.5 relative flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              checked={selectedItems.includes(b.id!)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedItems([...selectedItems, b.id!]);
                                else setSelectedItems(selectedItems.filter(id => id !== b.id));
                              }}
                              className="peer opacity-0 absolute w-full h-full cursor-pointer"
                            />
                            <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded peer-checked:bg-brand peer-checked:border-brand flex items-center justify-center text-white transition-colors">
                              <CheckSquare size={14} className="opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          <span className="text-sm font-medium text-on-surface line-clamp-2 group-hover:text-brand transition-colors">{b.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Select Projects */}
                  <div>
                    <label className="text-sm font-bold text-on-surface-variant block mb-3">Select Projects</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar border border-outline-variant rounded-xl p-3 bg-slate-50 dark:bg-slate-800/30">
                      {projects.map(p => (
                        <label key={p.id} className="flex items-start gap-3 cursor-pointer group">
                          <div className="mt-0.5 relative flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              checked={selectedItems.includes(p.id!)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedItems([...selectedItems, p.id!]);
                                else setSelectedItems(selectedItems.filter(id => id !== p.id));
                              }}
                              className="peer opacity-0 absolute w-full h-full cursor-pointer"
                            />
                            <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded peer-checked:bg-brand peer-checked:border-brand flex items-center justify-center text-white transition-colors">
                              <CheckSquare size={14} className="opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          <span className="text-sm font-medium text-on-surface line-clamp-2 group-hover:text-brand transition-colors">{p.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-on-surface-variant block mb-2">Email Subject (Optional)</label>
                  <input 
                    type="text" 
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Auto-generated if left blank"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-outline-variant text-on-surface focus:ring-2 focus:ring-brand outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-on-surface-variant block mb-2">Short Message (Optional)</label>
                  <textarea 
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Auto-generated if left blank"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-outline-variant text-on-surface focus:ring-2 focus:ring-brand outline-none resize-none h-24 transition-colors"
                  />
                </div>
                
                <div className="bg-brand/10 text-brand p-4 rounded-xl flex gap-3 text-sm">
                  <Mail className="shrink-0 mt-0.5" size={18} />
                  <p>This will immediately send an email to <strong>{selectedSubscribers.length}</strong> selected recipients with the <strong>{selectedItems.length}</strong> items you selected. Ensure your EmailJS template uses the variable: <code>{`{{{items_html}}}`}</code> (Triple braces for raw HTML).</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-outline-variant shrink-0">
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSending}
                  className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-variant transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBroadcast}
                  disabled={isSending || selectedItems.length === 0}
                  className="px-6 py-2.5 bg-brand hover:bg-brand-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSending ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                  {isSending ? 'Sending...' : 'Send Broadcast'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
