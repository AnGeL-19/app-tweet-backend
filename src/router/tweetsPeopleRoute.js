const { Router } = require("express");
const { check } = require("express-validator");

const {
  getTweetsFollowing,
  getTweetsExplore,
  getTweetsAndRetweets,
  getHashtags,
  getSearchHashtag,
  getTweetsByUserId,
  getTweetsSaved,
  getTweetsLiked,
} = require("../controllers/tweetsPeopleController");

const {
  validTweetExist,
  validCommentExist,
} = require("../helpers/db-validationTweet");

const {
  validInputs,
  validParamHashtag,
} = require("../middlewares/validate-inputs");
const { validateJWT } = require("../middlewares/validate-jwt");

const router = Router();

router.get("/saved", [validateJWT], getTweetsSaved);

router.get("/liked", [validateJWT], getTweetsLiked);

router.get("/explore", [validateJWT], getTweetsExplore);

router.get("/hashtags", [validateJWT], getHashtags);

router.get("/", [validateJWT], getTweetsFollowing);

module.exports = router;
