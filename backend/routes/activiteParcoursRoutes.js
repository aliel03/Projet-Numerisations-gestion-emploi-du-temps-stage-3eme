const express = require("express");
const ActiviteParcoursControllers = require("../controllers/activiteParcoursControllers");

const router = express.Router();

router.get("/", ActiviteParcoursControllers.getAllActivitesParcours);
router.get("/parcours", ActiviteParcoursControllers.getActivitesByAllParcours);
router.get("/:parcoursId", ActiviteParcoursControllers.getActiviteByParcours);
router.get(
  "/eleve/:eleveId",
  ActiviteParcoursControllers.getActiviteParcByEleve
);
router.get(
  "/professeur/:profId",
  ActiviteParcoursControllers.getActiviteParcByProf
);
router.post("/", ActiviteParcoursControllers.associateActiviteParcours);
router.post("/parcours", ActiviteParcoursControllers.associateActToAllParc);
router.delete(
  "/",
  ActiviteParcoursControllers.deleteActiviteParcoursAssociation
);

module.exports = router;
