const Docker = require('dockerode');

// Connect to the local Docker daemon via socket
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

module.exports = docker;
