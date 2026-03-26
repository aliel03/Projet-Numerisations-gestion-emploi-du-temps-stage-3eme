const express = require("express");
const planningWeekControllers = require("../controllers/planningWeekControllers");

const router = express.Router();

router.get("/", planningWeekControllers.getAllPlanningWeeks);
router.put("/:weekStart/status", planningWeekControllers.updatePlanningWeekStatus);

module.exports = router;
