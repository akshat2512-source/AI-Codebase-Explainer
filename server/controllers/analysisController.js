const Analysis = require('../models/Analysis');

/**
 * @desc    Save or update a repository analysis (upsert by userId + repoUrl)
 * @route   POST /api/analysis
 * @access  Private
 */
const saveAnalysis = async (req, res) => {
  try {
    const { repoUrl, repoName, owner, metadata, techStack, aiExplanation } = req.body;

    if (!repoUrl || !repoName || !owner) {
      return res.status(400).json({ message: 'repoUrl, repoName, and owner are required' });
    }

    const analysis = await Analysis.findOneAndUpdate(
      { userId: req.user._id, repoUrl },
      {
        userId: req.user._id,
        repoUrl,
        repoName,
        owner,
        metadata: metadata || {},
        techStack: techStack || {},
        aiExplanation: aiExplanation || {},
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all analyses for the logged-in user
 * @route   GET /api/analysis
 * @access  Private
 */
const getUserAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('-metadata -aiExplanation') // lighter payload for list view
      .lean();

    res.json(analyses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get a single analysis by ID
 * @route   GET /api/analysis/:id
 * @access  Private
 */
const getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete an analysis
 * @route   DELETE /api/analysis/:id
 * @access  Private
 */
const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    res.json({ message: 'Analysis deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { saveAnalysis, getUserAnalyses, getAnalysisById, deleteAnalysis };
