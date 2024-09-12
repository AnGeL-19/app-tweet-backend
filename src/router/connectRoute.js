const { Router } = require("express");

const { validateJWT } = require("../middlewares/validate-jwt");
const { getConnects, getRecommendConnects } = require("../controllers/connectController");

const router = Router();

router.get("/recommend", [validateJWT], getRecommendConnects);

router.get("/", [validateJWT], getConnects);

module.exports = router;
