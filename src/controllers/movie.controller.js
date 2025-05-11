import Movie from "../models/movie.model.js";

export async function getAllMovies(req, res) {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const query = {
      name: { $regex: search, $options: "i" },
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [movies, total] = await Promise.all([
      Movie.find(query)
        .populate("createdBy", "username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Movie.countDocuments(query),
    ]);

    res.json({
      data: movies,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching movies", error: error.message });
  }
}

export async function getMovie(req, res) {
  const { id } = req.params;

  try {
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json(movie);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching movie", error: error.message });
  }
}

export async function postMovie(req, res) {
  const { name, releaseDate, duration, actors } = req.body;

  try {
    const movie = new Movie({
      name,
      releaseDate,
      duration,
      actors,
      createdBy: req.user._id,
    });

    await movie.save();

    req.app.get("io").emit("movieCreated", movie);

    res.status(201).json(movie);
  } catch (error) {
    console.log("post movie failed:", error);
    res
      .status(500)
      .json({ message: "Error creating movie", error: error.message });
  }
}

export async function editMovie(req, res) {
  const { name, releaseDate, duration, actors } = req.body;
  const id = req.params.id;

  try {
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    if (movie.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this movie" });
    }

    movie.name = name;
    movie.releaseDate = releaseDate;
    movie.duration = duration;
    movie.actors = actors;

    await movie.save();

    req.app.get("io").emit("movieUpdated", movie);

    res.json(movie);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating movie", error: error.message });
  }
}

export async function deleteMovie(req, res) {
  const { id } = req.params;

  try {
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    if (movie.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this movie" });
    }

    await Movie.deleteOne({ _id: id });

    req.app.get("io").emit("movieDeleted", id);

    res.json({ message: "Movie deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting movie", error: error.message });
  }
}

export async function rateMovie(req, res) {
  const { rating, comment } = req.body;
  const { id } = req.params;

  try {
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    if (movie.hasUserRated(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You have already rated this movie" });
    }

    movie.ratings.push({
      user: req.user._id,
      rating,
      comment,
    });

    await movie.save();

    req.app.get("io").emit("movieRated", movie);

    res.json(movie);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error rating movie", error: error.message });
  }
}
