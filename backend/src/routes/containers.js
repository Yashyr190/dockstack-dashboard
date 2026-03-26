const express = require('express');
const router = express.Router();
const docker = require('../services/docker');
const auth = require('../middleware/auth');



// Get all containers
router.get('/', async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    res.json(containers);
  } catch (err) {
    console.error('Error listing containers:', err);
    res.status(500).json({ error: 'Failed to list containers' });
  }
});

// Deploy (pull image and run)
router.post('/deploy', async (req, res) => {
  try {
    const { image, name, env, ports } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image name is required' });
    }

    // Pull image
    await new Promise((resolve, reject) => {
      docker.pull(image, (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, onFinished, onProgress);
        function onFinished(err, output) {
          if (err) return reject(err);
          resolve(output);
        }
        function onProgress(event) {
          // Can stream progress back to client via SSE/WebSocket if needed
        }
      });
    });

    // Parse env and ports
    // env: [{key, value}] -> ["KEY=VALUE"]
    const Env = (env || []).map(e => `${e.key}=${e.value}`);
    
    // ports: [{hostPort, containerPort}]
    const PortBindings = {};
    const ExposedPorts = {};
    
    if (ports && ports.length > 0) {
      ports.forEach(p => {
        PortBindings[`${p.containerPort}/tcp`] = [{ HostPort: p.hostPort }];
        ExposedPorts[`${p.containerPort}/tcp`] = {};
      });
    }

    const containerOptions = {
      Image: image,
      Env,
      ExposedPorts,
      HostConfig: {
        PortBindings
      }
    };

    if (name) {
      containerOptions.name = name;
    }

    const container = await docker.createContainer(containerOptions);
    await container.start();
    
    res.status(201).json({ message: 'Container deployed successfully', id: container.id });
  } catch (err) {
    console.error('Error deploying container:', err);
    res.status(500).json({ error: 'Failed to deploy container', details: err.message });
  }
});

// Get Container Stats
router.get('/:id/stats', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    const stats = await container.stats({ stream: false });
    
    // Simple calc
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const NUMBER_OF_CPUS = stats.cpu_stats.online_cpus;
    const cpuPercent = (cpuDelta / systemDelta) * NUMBER_OF_CPUS * 100.0;
    
    const usedMemory = stats.memory_stats.usage - (stats.memory_stats.stats.cache || 0);
    const availableMemory = stats.memory_stats.limit;
    const memoryPercent = (usedMemory / availableMemory) * 100.0;

    res.json({
      cpuPercent: cpuPercent.toFixed(2),
      memoryPercent: memoryPercent.toFixed(2),
      memoryUsage: (usedMemory / 1024 / 1024).toFixed(2) + ' MB'
    });
  } catch (err) {
    console.error('Error fetching container stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get Container Logs
router.get('/:id/logs', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail: 100
    });
    // Logs come as a buffer with headers, need to slice string
    res.send(logs.toString('utf-8'));
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Start Container
router.post('/:id/start', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.start();
    res.json({ message: 'Container started' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stop Container
router.post('/:id/stop', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.stop();
    res.json({ message: 'Container stopped' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restart Container
router.post('/:id/restart', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.restart();
    res.json({ message: 'Container restarted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Container
router.delete('/:id', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.remove({ force: true });
    res.json({ message: 'Container deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
