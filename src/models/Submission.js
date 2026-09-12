import mongoose from 'mongoose';

/**
 * Submission Schema
 * Designed without any validation as requested:
 * Accepts any name and email values (including blank or unformatted strings).
 */
const submissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    host: {
      type: String,
      required: false,
    },
    subdomain: {
      type: String,
      required: false,
    },
    path: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    strict: false,
    validateBeforeSave: false, // Explicitly disable any validation
  }
);

export const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
