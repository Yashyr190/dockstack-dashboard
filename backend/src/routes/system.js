const express = require('express');
const router = express.Router();
const docker = require('../services/docker');
const auth = require('../middleware/auth');



router.get('/stats', async (req, res) => {
  try {
    let containers = [];

    try {
      containers = await docker.listContainers({ all: true });
    } catch (dockerErr) {
      console.log("Docker not running, using mock data");
      containers = [
        { State: 'running' },
        { State: 'exited' }
      ];
    }

    const total = containers.length;
    let running = 0;
    let stopped = 0;

    containers.forEach(c => {
      if (c.State === 'running') running++;
      else stopped++;
    });

    res.json({
      total,
      running,
      stopped
    });
  } catch (err) {
    console.error('Error fetching system stats:', err);
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
});

module.exports = router;
