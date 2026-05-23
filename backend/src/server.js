const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`\n  🏠  Real Estate API`);
  console.log(`      Listening on  http://localhost:${env.port}`);
  console.log(`      API docs      http://localhost:${env.port}/api-docs`);
  console.log(`      Health        http://localhost:${env.port}/api/health\n`);
});

const shutdown = async (signal) => {
  // eslint-disable-next-line no-console
  console.log(`\n[${signal}] graceful shutdown`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
