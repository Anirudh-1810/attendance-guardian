const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['warn', 'error'],
});

// Eagerly connect to the database on startup to avoid cold-start latency on first request
prisma.$connect()
    .then(() => console.log('Connected to database'))
    .catch((err) => console.error('Failed to connect to database:', err));

module.exports = prisma;
