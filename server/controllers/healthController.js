const getHealthStatus = (req, res) => {
  res.status(200).json({
    status: 'Server running',
  });
};

module.exports = {
  getHealthStatus,
};
