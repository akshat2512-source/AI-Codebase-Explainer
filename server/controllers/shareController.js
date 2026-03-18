const Analysis = require('../models/Analysis');

/**
 * @desc    Get a shared analysis by its shareId (public, no auth)
 * @route   GET /api/share/:shareId
 * @access  Public
 */
const getSharedAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      shareId: req.params.shareId,
    })
      .select('-userId') // don't leak internal user id
      .lean();

    if (!analysis) {
      return res.status(404).json({ message: 'Shared analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Share lookup error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSharedAnalysis };
