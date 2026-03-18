const Analysis = require('../models/Analysis');
const { generateAnalysisReport } = require('../services/reportService');

/**
 * @desc    Download a PDF analysis report
 * @route   GET /api/report/:analysisId
 * @access  Private
 */
const downloadReport = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.analysisId,
      userId: req.user._id,
    }).lean();

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    const { stream, fileName } = generateAnalysisReport(analysis);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    stream.pipe(res);

    stream.on('error', (err) => {
      console.error('PDF stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to generate PDF' });
      }
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { downloadReport };
