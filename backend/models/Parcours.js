const { DataTypes } = require("sequelize");
const db = require("../config/dbConfig");

const Parcours = db.define("Parcours", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  planningWeekId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "PlanningWeeks",
      key: "id",
    },
  },
});

module.exports = Parcours;
