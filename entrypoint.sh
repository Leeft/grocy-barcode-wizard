#!/bin/sh

# Path where the user mounts their volume
DATA_DIR="/app/data"
DB_PATH="$DATA_DIR/bcw.db"

# 1. Check if the database exists in the volume
if [ ! -f "$DB_PATH" ]; then
    echo "No database found in $DATA_DIR. Initializing from default..."
    cp /app/default/bcw.db "$DB_PATH"
else
    echo "Existing database found. Skipping initialization."
fi

# 2. (Optional) Run migrations to ensure the schema is up to date
# XXX: Migrations are not set up yet
# echo "Running database migrations..."
# pnpm db:migrate 

# 3. Execute the CMD from the Dockerfile
exec "$@"