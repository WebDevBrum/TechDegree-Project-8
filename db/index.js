const Sequelize = require("sequelize");

/* -- Allows the use of sequelize to make SQL database requests --- */
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "library.db",
  logging: false,
});

const db = {
  sequelize,
  Sequelize,
  models: {},
};

db.models.Book = require("./models/book.js")(sequelize);

module.exports = db;
