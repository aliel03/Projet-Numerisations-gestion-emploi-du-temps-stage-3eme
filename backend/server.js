const http = require("http");
const app = require("./app");
const sequelize = require("./config/dbConfig");
const { DataTypes } = require("sequelize");

const PORT = process.env.PORT || 4000;

const ensureSchemaUpdates = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    const parcoursDescription = await queryInterface.describeTable("Parcours");
    const planningWeekDescription = await queryInterface.describeTable(
      "PlanningWeeks"
    );

    if (!parcoursDescription.planningWeekId) {
      await queryInterface.addColumn("Parcours", "planningWeekId", {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "PlanningWeeks",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }

    if (!planningWeekDescription.status) {
      await queryInterface.addColumn("PlanningWeeks", "status", {
        type: DataTypes.ENUM("brouillon", "genere", "valide"),
        allowNull: false,
        defaultValue: "brouillon",
      });
    }

    if (!planningWeekDescription.hasManualAdjustments) {
      await queryInterface.addColumn("PlanningWeeks", "hasManualAdjustments", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  } catch (error) {
    console.error("Unable to update database schema:", error);
    throw error;
  }
};

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await ensureSchemaUpdates();
    console.log("Database connection established and models synced.");

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database or sync models:", error);
  }
})();
