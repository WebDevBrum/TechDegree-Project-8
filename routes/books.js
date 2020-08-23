const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();

/**---Database access---*/
const db = require("../db");
const { Book } = db.models;
const { Op } = db.Sequelize;

/**--Makes data from response body more accessible---*/
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


/*---Handles async/await error handling within routes---*/
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

/*---Simplifies additional error calls within routes --- */
function errorPush(status, next) {
  const err = new Error();
  err.status = status;
  next(err);
}

/*--Enables initial index call and pagination from database, see page/:id route--*/
async function libraryIndex(page, res, next) {
  let page_size = 8;
  const offset = page * page_size;

  const { count, rows } = await Book.findAndCountAll({
    where: { id: { [Op.gte]: 0 } },
    offset: offset,
    limit: page_size,
    order: [
      ["author", "ASC"],
      ["title", "ASC"],
    ],
  });

  let numberOfPages = count / page_size;
  if (page < numberOfPages && page >= 0) {
    res.render("index", {
      books: rows,
      title: "Library Manager",
      pages: numberOfPages,
      currentPage: page,
    });
  } else {
    errorPush(500, next);
  }
}

/*--Enables search call and pagination from database, see page/:id route--*/
async function search(page, query, res, next) {
  let page_size = 8;
  const offset = page * page_size;

  const { count, rows } = await Book.findAndCountAll({
    where: {
      [Op.or]: [
        {
          title: { [Op.substring]: query },
        },
        {
          author: { [Op.substring]: query },
        },
        {
          genre: { [Op.substring]: query },
        },
        {
          year: { [Op.substring]: query },
        },
      ],
    },
    offset: offset,
    limit: page_size,
    order: [
      ["author", "ASC"],
      ["title", "ASC"],
    ],
  });

  if (count === 0) {
    res.render("empty-search");
  } else {
    let numberOfPages = count / page_size;

    if (page < numberOfPages && page >= 0) {
      res.render("search", {
        books: rows,
        title: "Library Manager",
        pages: numberOfPages,
        currentPage: page,
        searchquery: query,
      });
    } else {
      errorPush(500, next);
    }
  }
}

/*---Reroutes initial route to index route-- */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.redirect("books/page/1");
  })
);

/*---Shows the full list of books--- */
/*---List determined either by initial visit or search ---*/
router.get(
  "/page/:id",
  asyncHandler(async (req, res, next) => {
    let page = req.params.id - 1;
    let query = req.query.searchquery;

    if (!isNaN(page)) {
      if (query === undefined || query === " ") {
        await libraryIndex(page, res, next);
      } else {
        await search(page, query, res, next);
      }
    } else {
      errorPush(500, next);
    }
  })
);

/* --- Shows the create new book form --- */
router.get(
  "/new",
  asyncHandler(async (req, res) => {
    res.render("new-book", { books: {} });
  })
);

/* --- Posts a new book to the database --- */
router.post(
  "/new",
  asyncHandler(async (req, res) => {
    let books;
    try {
      books = await Book.create(req.body);
      res.redirect("/");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        books = await Book.build(req.body);

        res.render("new-book", { books: {}, errors: error.errors });
      } else {
        throw error;
      }
    }
  })
);

/* --- Shows book detail form ---*/
router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const books = await Book.findByPk(req.params.id);
    if (books) {
      res.render("update-book", { books: books });
    } else {
      errorPush(500, next);
    }
  })
);

/* ---Updates book info in the database ---*/
router.post(
  "/:id",
  asyncHandler(async (req, res) => {
    let books;
    try {
      books = await Book.findByPk(req.params.id);
      await books.update(req.body);
      res.redirect("/books/page/1");
    } catch (error) {
      res.render("update-book", { books: books, errors: error.errors });
    }
  })
);

/* --- Deletes a book --- */
router.post(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    const books = await Book.findByPk(req.params.id);
    await books.destroy();
    res.redirect("/");
  })
);

module.exports = router;