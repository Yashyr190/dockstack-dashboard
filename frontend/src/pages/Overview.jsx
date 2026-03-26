import { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, Play, Square, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Overview() {
  const [stats, setStats] = useState({ total: 0, running: 0, stopped: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/system/stats');
      setStats(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch system stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Containers',
      value: stats.total,
      icon: Server,
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Running',
      value: stats.running,
      icon: Play,
      color: 'emerald',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20'
    },
    {
      title: 'Stopped',
      value: stats.stopped,
      icon: Square,
      color: 'slate',
      bgColor: 'bg-slate-500/10',
      textColor: 'text-slate-400',
      borderColor: 'border-slate-500/20'
    }
  ];

  if (loading && !stats.total) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-400">Loading system overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-400 mt-1">System overview and container metrics</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-3"></div>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel p-6 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
                  <h3 className="text-4xl font-bold text-white">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.borderColor} border`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 glass-panel rounded-2xl p-8 border border-slate-700/50 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
          <Server className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Welcome to DockStack</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Manage your containerized deployments across your virtualized infrastructure. 
          Navigate to the Containers section to deploy new services or manage existing ones.
        </p>
      </div>
    </div>
  );
}
