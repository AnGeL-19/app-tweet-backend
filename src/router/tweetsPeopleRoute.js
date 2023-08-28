const { Router } = require("express");
const { check } = require("express-validator");

const {
  getTweetsFollowing,
  getTweetsPopular,
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

router.get("/populates", [validateJWT], getTweetsPopular);

router.get("/hashtags", [validateJWT], getHashtags);

router.get(
  "/hashtag/search",
  [validateJWT, validParamHashtag, validInputs],
  getSearchHashtag
);

router.get("/", [validateJWT], getTweetsFollowing);

module.exports = router;
