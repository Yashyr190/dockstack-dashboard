import { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Square, RefreshCw, Trash2, Plus, Search, Loader, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import DeployModal from '../components/DeployModal';

export default function ContainersList() {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchContainers = async () => {
    try {
      const res = await axios.get('/api/containers');
      setContainers(res.data);
    } catch (err) {
      console.error('Error fetching containers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 5000); // Polling every 5s
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      if (action === 'delete') {
        if (!window.confirm('Are you sure you want to completely remove this container?')) return;
        await axios.delete(`/api/containers/${id}`);
      } else {
        await axios.post(`/api/containers/${id}/${action}`);
      }
      await fetchContainers();
    } catch (err) {
      alert(`Failed to ${action} container`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredContainers = containers.filter(c => 
    c.Names[0].toLowerCase().includes(search.toLowerCase()) || 
    c.Image.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Containers</h1>
          <p className="text-slate-400 mt-1">Manage your active and stopped deployments</p>
        </div>
        <button 
          onClick={() => setIsDeployModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          Deploy
        </button>
      </div>

      <div className="glass-panel border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700/50 flex items-center gap-4 bg-slate-800/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by name or image..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-sm"
            />
          </div>
          <button onClick={fetchContainers} className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 rounded-xl">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading && containers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48">
              <Loader className="w-8 h-8 animate-spin text-blue-500 mb-4" />
              <p className="text-slate-400">Loading containers...</p>
            </div>
          ) : filteredContainers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700">
                <AlertTriangle className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-white">No active containers found</h3>
              <p className="text-slate-400 mt-1">Start by deploying a new container image.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Image</th>
                  <th className="px-6 py-4 font-medium">State</th>
                  <th className="px-6 py-4 font-medium">Ports</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredContainers.map((container, idx) => {
                  const isRunning = container.State === 'running';
                  const name = container.Names[0].replace('/', '');
                  const ports = container.Ports?.map(p => `${p.PublicPort ? p.PublicPort + ':' : ''}${p.PrivatePort}`).slice(0, 2).join(', ');

                  return (
                    <motion.tr 
                      key={container.Id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <Link to={`/containers/${container.Id}`} className="font-medium text-white hover:text-blue-400 transition-colors">
                          {name}
                        </Link>
                        <div className="text-xs text-slate-500 font-mono mt-1">{container.Id.substring(0, 12)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {container.Image}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`w-2.5 h-2.5 rounded-full mr-2 ${isRunning ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-500'}`}></span>
                          <span className={`text-sm ${isRunning ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {container.State}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                        {ports || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {isRunning ? (
                            <>
                              <button onClick={() => handleAction(container.Id, 'restart')} disabled={actionLoading === container.Id} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Restart">
                                <RefreshCw className={`w-4 h-4 ${actionLoading === container.Id ? 'animate-spin' : ''}`} />
                              </button>
                              <button onClick={() => handleAction(container.Id, 'stop')} disabled={actionLoading === container.Id} className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors" title="Stop">
                                <Square className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => handleAction(container.Id, 'start')} disabled={actionLoading === container.Id} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Start">
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          <div className="w-px h-6 bg-slate-700/50 mx-1"></div>
                          <button onClick={() => handleAction(container.Id, 'delete')} disabled={actionLoading === container.Id} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isDeployModalOpen && <DeployModal onClose={() => {
        setIsDeployModalOpen(false);
        fetchContainers();
      }} />}
    </div>
  );
}
