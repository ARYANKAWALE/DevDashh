import mongoose from "mongoose";

/**
 * Short-lived reset tokens stored in their own collection.
 * Each document is automatically deleted by MongoDB's TTL index after 15 minutes.
 */
const passwordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  /** SHA-256 hash of the raw token sent to the user. Never store the raw token. */
  tokenHash: {
    type: String,
    required: true,
    unique: true,
  },
  /** TTL index — MongoDB auto-deletes the document 15 minutes after creation. */
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000),
    index: { expires: 0 }, // TTL: remove when expiresAt is reached
  },
});

export const PasswordResetToken = mongoose.model(
  "PasswordResetToken",
  passwordResetTokenSchema
);
