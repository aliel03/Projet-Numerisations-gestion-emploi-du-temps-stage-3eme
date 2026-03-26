const express = require("express");
const parcoursControllers = require("../controllers/parcoursControllers");

const router = express.Router();
router.get("/summary", parcoursControllers.getGenerationSummary);
router.post("/", parcoursControllers.generateParcours);

module.exports = router;
