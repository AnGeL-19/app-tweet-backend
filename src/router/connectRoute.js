const { Router } = require("express");

const { validateJWT } = require("../middlewares/validate-jwt");
const { getConnects, getRecommendConnects, connectUser } = require("../controllers/connectController");

const router = Router();

router.get("/recommend", [validateJWT], getRecommendConnects);

router.get("/", [validateJWT], getConnects);

router.put("/user/:userToId", [validateJWT], connectUser);

module.exports = router;
