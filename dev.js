const { spawn } = require('child_process');
const path = require('path');

console.log('🌸 Starting Masfeeh E-Commerce Platform...');

// Start Express Server
const server = spawn('node', ['index.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// Start Vite Client
const client = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\nShutting down Masfeeh services...');
  server.kill();
  client.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
