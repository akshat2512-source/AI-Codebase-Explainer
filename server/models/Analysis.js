const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    repoUrl: {
      type: String,
      required: [true, 'Repository URL is required'],
      trim: true,
    },
    repoName: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
    techStack: {
      type: Object,
      default: {},
    },
    aiExplanation: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

// Compound index: one cached analysis per user+repo pair
analysisSchema.index({ userId: 1, repoUrl: 1 }, { unique: true });

module.exports = mongoose.model('Analysis', analysisSchema);
