#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<EOSQL
    CREATE DATABASE notification_db;
    GRANT ALL PRIVILEGES ON DATABASE notification_db TO postgres;
EOSQL