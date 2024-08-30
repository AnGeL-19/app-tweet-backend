const { Router } = require("express");
const { check } = require("express-validator");

const {
  getTweetsFollowing,
  getTweetsBookMarks,
  getHashtags,

  getTweetsSaved,
  getTweetsExplore,
} = require("../controllers/tweetsPeopleController");

const {
} = require("../helpers/db-validationTweet");

const {
} = require("../middlewares/validate-inputs");
const { validateJWT } = require("../middlewares/validate-jwt");

const router = Router();

router.get("/bookmarks", [validateJWT], getTweetsBookMarks);

router.get("/explore", [validateJWT], getTweetsExplore);

router.get("/trends", [validateJWT], getHashtags);

router.get("/", [validateJWT], getTweetsFollowing);

module.exports = router;
