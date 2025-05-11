import express from "express";
import * as movieController from "../controllers/movie.controller.js";
import { checkJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @route GET /api/movies
 * @desc Get all movies
 * @access Public
 */
router.get("/", movieController.getAllMovies);

/**
 * @route GET /api/movies/:id
 * @desc Get a movie
 * @access Public
 */
router.get("/:id", movieController.getMovie);

/**
 * @route POST /api/movies
 * @desc Create a new movie
 * @access Private
 */
router.post("/", checkJWT, movieController.postMovie);

/**
 * @route PUT /api/movies/:id
 * @desc Update a movie
 * @access Private
 */
router.put("/:id", checkJWT, movieController.editMovie);

/**
 * @route DELETE /api/movies/:id
 * @desc Delete a movie
 * @access Private
 */
router.delete("/:id", checkJWT, movieController.deleteMovie);

/**
 * @route POST /api/movies/:id/rate
 * @desc Rate a movie
 * @access Private
 */
router.post("/:id/rate", checkJWT, movieController.rateMovie);

export default router;
