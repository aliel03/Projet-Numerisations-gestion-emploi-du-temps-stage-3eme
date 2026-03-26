const express = require("express");
const planningFixedActivityControllers = require("../controllers/planningFixedActivityControllers");

const router = express.Router();

router.get("/", planningFixedActivityControllers.getFixedActivitiesByWeek);
router.post("/", planningFixedActivityControllers.createFixedActivity);
router.delete("/:id", planningFixedActivityControllers.deleteFixedActivity);

module.exports = router;
