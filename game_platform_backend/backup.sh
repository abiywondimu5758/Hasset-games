#!/bin/bash
while true; do
  echo "Starting backup at $(date)" >> /backups/backup.log  # Log the start of the backup
  export PGPASSWORD=root  # Ensure the password is set
  pg_dump -h db -U postgres game_platform > /backups/db_backup_$(date +'%Y-%m-%d_%H-%M-%S').sql 2>> /backups/backup_error.log
  if [ $? -ne 0 ]; then
    echo "Backup failed at $(date)" >> /backups/backup.log  # Log failure
  else
    echo "Backup completed successfully at $(date)" >> /backups/backup.log  # Log success
  fi
  sleep 10800  # Wait for 3 hours before the next backup
done

