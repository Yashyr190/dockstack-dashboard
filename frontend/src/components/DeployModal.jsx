import { useState } from 'react';
import axios from 'axios';
import { X, Plus, Trash2, Box, Package, Terminal, Network, Loader, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DeployModal({ onClose }) {
  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [ports, setPorts] = useState([{ hostPort: '', containerPort: '' }]);
  const [envParams, setEnvParams] = useState([{ key: '', value: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeploy = async (e) => {
    e.preventDefault();
    if (!image || image.trim() === "") {
  setError("Image name is required");
  return;
}
    }

    setLoading(true);
    setError('');

    // Clean up empty fields
    const validPorts = ports.filter(p => p.hostPort && p.containerPort);
    const validEnv = envParams.filter(e => e.key && e.value);

    try {
      await axios.post('/api/containers/deploy', {
        image,
        name,
        ports: validPorts,
        env: validEnv
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError(
  err.response?.data?.details ||
  err.response?.data?.error ||
  "Deployment failed. Please check Docker status or port conflicts."
);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !loading && onClose()}></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="glass-panel w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Deploy Container</h2>
              <p className="text-sm text-slate-400 mt-0.5">Pull and run a new image</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleDeploy} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-slate-300 uppercase flex items-center gap-2">
              <Box className="w-4 h-4" /> Core Config
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Image Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. nginx:latest, redis"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Container Name (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. my-web-server"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5"
                />
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-slate-700/50"></div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wider text-slate-300 uppercase flex items-center gap-2">
                <Network className="w-4 h-4" /> Port Mappings
              </h3>
              <button 
                type="button" 
                onClick={() => setPorts([...ports, { hostPort: '', containerPort: '' }])}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-md"
              >
                <Plus className="w-3 h-3" /> Add Map
              </button>
            </div>
            
            <div className="space-y-2">
              {ports.map((port, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Host Port (e.g. 8080)"
                    value={port.hostPort}
                    onChange={(e) => {
                      const newPorts = [...ports];
                      newPorts[index].hostPort = e.target.value;
                      setPorts(newPorts);
                    }}
                    className="flex-1 glass-input rounded-xl px-4 py-2 text-sm"
                  />
                  <span className="text-slate-500 font-bold">:</span>
                  <input
                    type="text"
                    placeholder="Container Port (e.g. 80)"
                    value={port.containerPort}
                    onChange={(e) => {
                      const newPorts = [...ports];
                      newPorts[index].containerPort = e.target.value;
                      setPorts(newPorts);
                    }}
                    className="flex-1 glass-input rounded-xl px-4 py-2 text-sm"
                  />
                  <button 
                    type="button" 
                    onClick={() => setPorts(ports.filter((_, i) => i !== index))}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {ports.length === 0 && <p className="text-sm text-slate-500 italic">No port mappings defined</p>}
            </div>
          </div>

          <div className="h-px w-full bg-slate-700/50"></div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wider text-slate-300 uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4" /> Environment Variables
              </h3>
              <button 
                type="button" 
                onClick={() => setEnvParams([...envParams, { key: '', value: '' }])}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-md"
              >
                <Plus className="w-3 h-3" /> Add Entity
              </button>
            </div>
            
            <div className="space-y-2">
              {envParams.map((env, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Key (e.g. DB_PASS)"
                    value={env.key}
                    onChange={(e) => {
                      const newEnv = [...envParams];
                      newEnv[index].key = e.target.value;
                      setEnvParams(newEnv);
                    }}
                    className="flex-1 glass-input rounded-xl px-4 py-2 text-sm font-mono"
                  />
                  <span className="text-slate-500 font-bold">=</span>
                  <input
                    type="text"
                    placeholder="Value (e.g. mysecret)"
                    value={env.value}
                    onChange={(e) => {
                      const newEnv = [...envParams];
                      newEnv[index].value = e.target.value;
                      setEnvParams(newEnv);
                    }}
                    className="flex-1 glass-input rounded-xl px-4 py-2 text-sm font-mono"
                  />
                  <button 
                    type="button" 
                    onClick={() => setEnvParams(envParams.filter((_, i) => i !== index))}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {envParams.length === 0 && <p className="text-sm text-slate-500 italic">No environment variables defined</p>}
            </div>
          </div>

        </form>

        <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3 flex-shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleDeploy}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] shadow-blue-500/20"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Deploying... (May take a while to pull)
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Deploy Container
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
