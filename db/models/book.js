const Sequelize = require("sequelize");

/*-- Creates our book model--- */
module.exports = (sequelize) => {
  class Book extends Sequelize.Model {}
  Book.init(
    {
      title: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: {
            msg: '"Title" is required',
          },
        },
      },
      author: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: {
            msg: '"Author" is required',
          },
        },
      },
      genre: Sequelize.STRING,
      year: Sequelize.INTEGER,
    },
    { sequelize }
  );
  return Book;
};
