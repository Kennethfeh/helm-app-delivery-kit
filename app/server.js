const express = require('express');

const createApp = () => {
  const app = express();
  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.get('/api/message', (_req, res) => {
    res.json({ message: process.env.APP_MESSAGE || 'Hello from Helm' });
  });
  return app;
};

const port = process.env.PORT || 5000;

if (require.main === module) {
  const app = createApp();
  app.listen(port, () => {
    console.info(`App listening on ${port}`);
  });
}

module.exports = { createApp };
