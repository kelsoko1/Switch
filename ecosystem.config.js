module.exports = {
  apps: [
    {
      name: 'kijumbesmart-app',
      script: 'server/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 2025
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 2025
      }
    }
  ]
};
