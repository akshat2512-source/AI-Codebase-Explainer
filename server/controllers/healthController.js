/**
 * @desc   Health-check endpoint — useful for uptime monitors and deployment verification
 * @route  GET /api/health
 */
const getHealthStatus = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealthStatus,
};
