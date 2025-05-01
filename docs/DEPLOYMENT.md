# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Git

## Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd notification-system
```

2. Create environment files:
```bash
cp services/user-service/.env.example services/user-service/.env
cp services/notification-service/.env.example services/notification-service/.env
cp services/recommendation-service/.env.example services/recommendation-service/.env
cp gateway/.env.example gateway/.env
```

3. Update environment variables in each `.env` file:
- Database credentials
- JWT secrets
- Service URLs
- Log levels

## Docker Deployment

1. Build and start services:
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d
```

2. Verify services:
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

3. Access services:
- GraphQL Playground: http://localhost:4000/graphql
- RabbitMQ Management: http://localhost:15672
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

## Local Development

1. Install dependencies:
```bash
# Install root dependencies
npm install

# Install service dependencies
cd services/user-service && npm install
cd ../notification-service && npm install
cd ../recommendation-service && npm install
cd ../../gateway && npm install
```

2. Start services:
```bash
# Start databases and message queue
docker-compose up -d postgres mongodb rabbitmq redis

# Start services in development mode
cd services/user-service && npm run dev
cd ../notification-service && npm run dev
cd ../recommendation-service && npm run dev
cd ../../gateway && npm run dev
```

## Monitoring Setup

1. Prometheus Configuration:
```yaml
# docker/prometheus/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'services'
    static_configs:
      - targets: ['user-service:3001', 'notification-service:3002', 'recommendation-service:3003', 'gateway:4000']
```

2. Grafana Setup:
- Access http://localhost:3000
- Login with admin/admin
- Add Prometheus data source
- Import dashboards

## Health Checks

1. Service Health:
```bash
# Check user service
curl http://localhost:3001/health

# Check notification service
curl http://localhost:3002/health

# Check recommendation service
curl http://localhost:3003/health

# Check gateway
curl http://localhost:4000/health
```

2. Database Health:
```bash
# Check PostgreSQL
docker-compose exec postgres pg_isready -U postgres

# Check MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

3. Message Queue Health:
```bash
# Check RabbitMQ
docker-compose exec rabbitmq rabbitmq-diagnostics check_port_connectivity
```

## Troubleshooting

1. Service Issues:
- Check service logs
- Verify environment variables
- Check database connections
- Verify message queue status

2. Database Issues:
- Check volume mounts
- Verify credentials
- Check connection strings
- Monitor resource usage

3. Message Queue Issues:
- Check queue status
- Monitor message flow
- Verify exchanges
- Check dead-letter queues

4. Performance Issues:
- Monitor service metrics
- Check cache hit rates
- Monitor database queries
- Check message queue backlog

## Scaling

1. Horizontal Scaling:
```bash
# Scale user service
docker-compose up -d --scale user-service=3

# Scale notification service
docker-compose up -d --scale notification-service=3

# Scale recommendation service
docker-compose up -d --scale recommendation-service=3
```

2. Load Balancing:
- Configure Nginx for load balancing
- Set up service discovery
- Configure health checks
- Implement circuit breakers

## Backup and Recovery

1. Database Backups:
```bash
# PostgreSQL backup
docker-compose exec postgres pg_dump -U postgres user_db > backup.sql

# MongoDB backup
docker-compose exec mongodb mongodump --out /backup
```

2. Volume Backups:
```bash
# Backup volumes
docker run --rm -v notification-system_postgres_data:/source -v $(pwd):/backup alpine tar -czf /backup/postgres_backup.tar.gz /source
```

3. Recovery:
```bash
# Restore PostgreSQL
docker-compose exec postgres psql -U postgres user_db < backup.sql

# Restore MongoDB
docker-compose exec mongodb mongorestore /backup
``` 