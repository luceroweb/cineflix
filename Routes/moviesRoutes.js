const express = require("express");
const moviesController = require("../Controllers/moviesController");
const authController = require("./../Controllers/authController");

const router = express.Router();

router
  .route("/highest-rated")
  .get(moviesController.getHigestRated, moviesController.getAllMovies);

router.route("/movie-stats").get(moviesController.getMovieStats);

router.route("/movies-by-genre/:genre").get(moviesController.getMovieByGenre);

router
  .route("/")
  .get(moviesController.getAllMovies)
  .post(authController.protect, moviesController.createMovie);

router
  .route("/:id")
  .get(moviesController.getMovie)
  .patch(authController.protect, moviesController.updateMovie)
  .delete(
    authController.protect,
    authController.restrict("admin"),
    moviesController.deleteMovie
  );

module.exports = router;
