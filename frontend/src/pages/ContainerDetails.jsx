import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Activity, TerminalSquare, Loader } from 'lucide-react';

export default function ContainerDetails() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const logsEndRef = useRef(null);

  const fetchStatsAndLogs = async () => {
    try {
      if (activeTab === 'stats') {
        const statsRes = await axios.get(`/api/containers/${id}/stats`);
        setStats(statsRes.data);
      } else {
        const logsRes = await axios.get(`/api/containers/${id}/logs`);
        setLogs(logsRes.data);
      }
    } catch (err) {
      console.error('Error fetching container details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStatsAndLogs();
    const interval = setInterval(fetchStatsAndLogs, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [id, activeTab]);

  useEffect(() => {
    if (activeTab === 'logs' && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/containers" className="p-2 text-slate-400 hover:text-white glass-panel rounded-xl hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            Container Details
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-slate-700">
              {id.substring(0, 12)}
            </span>
          </h1>
        </div>
      </div>

      <div className="glass-panel border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="flex border-b border-slate-700/50">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'stats'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Activity className="w-4 h-4" /> Usage Stats
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <TerminalSquare className="w-4 h-4" /> Real-time Logs
          </button>
        </div>

        <div className="p-6">
          {loading && !stats && !logs ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader className="w-8 h-8 animate-spin text-blue-500 mb-4" />
              <p className="text-slate-400">Loading {activeTab}...</p>
            </div>
          ) : activeTab === 'stats' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-input p-6 rounded-2xl">
                <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" /> CPU Usage
                </h3>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold text-white">{stats?.cpuPercent || '0.00'}</span>
                  <span className="text-xl text-slate-400 mb-1">%</span>
                </div>
                <div className="mt-4 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500 ease-in-out" 
                    style={{ width: `${Math.min(parseFloat(stats?.cpuPercent || 0), 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="glass-input p-6 rounded-2xl">
                <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> Memory Usage
                </h3>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold text-white">{stats?.memoryUsage?.replace(' MB', '') || '0'}</span>
                  <span className="text-xl text-slate-400 mb-1">MB</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">{stats?.memoryPercent || '0.00'}% of allocated chunk</p>
                <div className="mt-2 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500 ease-in-out" 
                    style={{ width: `${Math.min(parseFloat(stats?.memoryPercent || 0), 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0c1017] rounded-xl p-4 h-[500px] overflow-y-auto font-mono text-sm shadow-inner border border-slate-800 custom-scrollbar">
              {logs ? (
                <pre className="text-slate-300 whitespace-pre-wrap break-words">{logs}</pre>
              ) : (
                <p className="text-slate-500 italic text-center mt-4">No logs available for this container</p>
              )}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
