const mongoose = require("mongoose");
const fs = require("fs");
const validator = require("validator");

const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is a required field!"],
      unique: true,
      maxlength: [100, "Movie name must not have more than 100 characters"],
      minlength: [4, "Movie name must have at leaset 4 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is a required field!"],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "Durration is a required fileld!"],
    },
    ratings: {
      type: Number,
      validate: {
        validator: function (value) {
          return value >= 1 && value <= 10;
        },
        message: "{VALUE} is out of range. It must be in the range 1 to 10.",
      },
    },
    totalRatings: {
      type: Number,
    },
    releaseYear: {
      type: Number,
      required: [true, "release year is a required field!"],
    },
    releaseDate: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    genres: {
      type: [String],
      required: [true, "Genres is required a field!"],
      // enum: {
      //   values: [
      //     "Action",
      //     "Adventure",
      //     "Sci-Fi",
      //     "Thriller",
      //     "Crime",
      //     "Drama",
      //     "Comedy",
      //     "Romance",
      //     "Biography",
      //   ],
      //   message: "This genre does not exist",
      // },
    },
    directors: {
      type: [String],
      required: [true, "Directors is a required field!"],
    },
    coverImage: {
      type: String,
      required: [true, "Cover image is a required field!"],
    },
    actors: {
      type: [String],
      required: [true, "Actors is a required field!"],
    },
    price: {
      type: Number,
      required: [true, "Price is a required field!"],
    },
    createdBy: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

movieSchema.virtual("durationInHours").get(function () {
  return this.duration / 60;
});

//EXECUTED BEFORE THE DOCUMENT IS SAVED IN THE DATABASE
//Does Run When: .save() or .create()
//Wont' Run When: insertMany, findByIdAndUpdate
movieSchema.pre("save", function (next) {
  this.createdBy = "JMAL";
  next();
});

movieSchema.post("save", function (doc, next) {
  const content = `A new movie document with name ${doc.name} has been created by ${doc.createdBy}\n`;
  fs.writeFileSync("./Log/log.txt", content, { flag: "a" }, (err) =>
    console.log(err.message)
  );
  next();
});

movieSchema.pre(/^find/, function (next) {
  this.find({ releaseDate: { $lte: Date.now() } });
  this.startTime = Date.now();
  next();
});

movieSchema.post(/^find/, function (docs, next) {
  this.find({ releaseDate: { $lte: Date.now() } });
  this.endTime = Date.now();

  const content = `Query took ${
    this.endTime - this.startTime
  } milliseconds to fetch the documents.`;
  fs.writeFileSync("./Log/log.txt", content, { flag: "a" }, (err) =>
    console.log(err.message)
  );

  next();
});

movieSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { releaseDate: { $lte: new Date() } } });
  next();
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
