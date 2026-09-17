require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenants');
const userRoutes = require('./routes/users');
const vehicleRoutes = require('./routes/vehicles');
const telemetryRoutes = require('./routes/telemetry');
const scoreRoutes = require('./routes/scores');
const alertRoutes = require('./routes/alerts');
const auditRoutes = require('./routes/audit');
const dashboardRoutes = require('./routes/dashboard');
const parkRoutes = require('./routes/parks');
const transitRouteRoutes = require('./routes/transitRoutes');
const paymentRoutes = require('./routes/payments');
const supportRoutes = require('./routes/support');

const app = express();
const PORT = process.env.PORT || 4000;

const origins = (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim());

app.use(helmet());
app.use(
  cors({
    origin: origins.includes('*') ? true : origins,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 10 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too Many Requests' },
});
app.use('/api/', limiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'plateau-fleet-api', time: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/telemetry', telemetryRoutes);
app.use('/api/v1/scores', scoreRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/parks', parkRoutes);
app.use('/api/v1/routes', transitRouteRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/support', supportRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Fleet API listening on :${PORT}`);
});
