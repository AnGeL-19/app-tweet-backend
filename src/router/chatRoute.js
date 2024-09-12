const { Router } = require("express");

const { validateJWT } = require("../middlewares/validate-jwt");
const { getConnects, getRecommendConnects } = require("../controllers/connectController");
const { getMessages } = require("../controllers/chatController");

const router = Router();

// router.get("/recommend", [validateJWT], getRecommendConnects);

router.get("/messages/:id", [validateJWT], getMessages);

module.exports = router;