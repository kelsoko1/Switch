#!/bin/bash

# This script sets up cron jobs for monitoring and backups

# Make scripts executable
chmod +x monitor.sh
chmod +x backup.sh
chmod +x health-check.sh

# Create temporary file for crontab
TEMP_CRON=$(mktemp)

# Export current crontab
crontab -l > $TEMP_CRON 2>/dev/null || echo "# KijumbeSmart cron jobs" > $TEMP_CRON

# Add monitoring job (every 5 minutes)
if ! grep -q "monitor.sh" $TEMP_CRON; then
  echo "*/5 * * * * /root/switch/monitor.sh >> /var/log/kijumbesmart-monitor.log 2>&1" >> $TEMP_CRON
  echo "Added monitoring job to crontab"
fi

# Add backup job (daily at 2 AM)
if ! grep -q "backup.sh" $TEMP_CRON; then
  echo "0 2 * * * /root/switch/backup.sh" >> $TEMP_CRON
  echo "Added backup job to crontab"
fi

# Add health check job (hourly)
if ! grep -q "health-check.sh" $TEMP_CRON; then
  echo "0 * * * * /root/switch/health-check.sh >> /var/log/kijumbesmart-health.log 2>&1" >> $TEMP_CRON
  echo "Added health check job to crontab"
fi

# Add log rotation job (weekly)
if ! grep -q "logrotate" $TEMP_CRON; then
  echo "0 0 * * 0 /usr/sbin/logrotate /etc/logrotate.d/kijumbesmart" >> $TEMP_CRON
  echo "Added log rotation job to crontab"
fi

# Install new crontab
crontab $TEMP_CRON
echo "Crontab updated successfully"

# Clean up
rm $TEMP_CRON

# Create logrotate configuration
cat > /etc/logrotate.d/kijumbesmart << EOF
/var/log/kijumbesmart-*.log {
  weekly
  rotate 12
  compress
  delaycompress
  missingok
  notifempty
  create 0640 root root
}
EOF

echo "Logrotate configuration created"

# Create log files if they don't exist
touch /var/log/kijumbesmart-monitor.log
touch /var/log/kijumbesmart-health.log
chmod 644 /var/log/kijumbesmart-*.log

echo "Setup completed successfully"
