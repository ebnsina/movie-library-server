import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // Duration in minutes
      required: true,
      min: 1,
    },
    actors: [
      {
        type: String,
        required: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ratings: [ratingSchema],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate avg. rating
movieSchema.pre("save", function (next) {
  if (this.ratings && this.ratings.length > 0) {
    const totalRating = this.ratings.reduce(
      (sum, rating) => sum + rating.rating,
      0
    );
    this.averageRating = totalRating / this.ratings.length;
  }
  next();
});

/**
 * Check if a user has already rated this movie
 * @param {ObjectId} userId - The ID of the user
 * @returns {boolean} Whether the user has rated this movie
 */
movieSchema.methods.hasUserRated = function (userId) {
  return this.ratings.some(
    (rating) => rating.user.toString() === userId.toString()
  );
};

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;
