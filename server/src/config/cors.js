const cors = require('cors');

function configureCors(app, origin) {
  const corsOptions = {
    origin: origin || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.use(cors(corsOptions));
}

module.exports = { configureCors };
