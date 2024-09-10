const { Router } = require("express");

const { validateJWT } = require("../middlewares/validate-jwt");
const { getConnects } = require("../controllers/connectController");

const router = Router();

// router.get("/bookmarks", [validateJWT], getTweetsBookMarks);

// router.get("/explore", [validateJWT], getTweetsExplore);

// router.get("/trends", [validateJWT], getHashtags);

router.get("/", [validateJWT], getConnects);

module.exports = router;
