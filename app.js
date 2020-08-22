const express = require("express");
const bodyParser = require("body-parser");
//const router = express.Router();

const db = require("./db");
const { Book } = db.models;
const { Op } = db.Sequelize;

const app = express();

app.set("view engine", "pug");
app.use("/static", express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

async function libraryIndex(page, res, next) {
  let page_size = 5;
  const offset = page * page_size;

  // if (isNaN(offset)) {
  //   const err = new Error();
  //   err.status = 500;
  //   next(err);
  // }
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
    console.log("error index");
    console.log(page);
    console.log(numberOfPages);
    const err = new Error();
    console.log(err);
    err.status = 500;
    next(err);
  }
}

async function search(page, query, res, next) {
  let page_size = 5;
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
  console.log(count);
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
      console.log("error search");
      console.log(page);
      console.log(numberOfPages);
      const err = new Error();
      console.log(err);
      err.status = 500;
      next(err);
    }
  }
}

//routes

/* Home route should redirect to the /books route.*/
app.get(
  "/",
  asyncHandler(async (req, res) => {
    res.redirect("/books/page/1"); //think i need to set up view templates first and then delete these res.sends, also have console.log for library items
  })
);

/*Shows the full list of books */
app.get(
  "/books/page/:id",
  asyncHandler(async (req, res, next) => {
    let page = req.params.id - 1;
    let query = req.query.searchquery;

    console.log(!isNaN(page));
    if (!isNaN(page)) {
      if (query === undefined || query === " ") {
        await libraryIndex(page, res, next);
      } else {
        await search(page, query, res, next);
      }
    } else {
      const err = new Error();
      err.status = 500;
      next(err);
    }
  })
);

/* Shows the create new book form*/
app.get(
  "/books/new",
  asyncHandler(async (req, res) => {
    res.render("new-book", { books: {} });
  })
);

/*Posts a new book to the database. */
app.post(
  "/books/new",
  asyncHandler(async (req, res) => {
    let books;
    try {
      books = await Book.create(req.body);
      res.redirect("/");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        books = await Book.build(req.body);
        console.log(error.errors);
        res.render("new-book", { books: {}, errors: error.errors });
        console.log(books);
      } else {
        throw error;
      }
    }
  })
);

/* Shows book detail form*/
app.get(
  "/books/:id",
  asyncHandler(async (req, res, next) => {
    const books = await Book.findByPk(req.params.id);
    if (books) {
      res.render("update-book", { books: books });
    } else {
      const err = new Error();
      err.status = 500;
      next(err);
    }
  })
);

/* Updates book info in the database*/
app.post(
  "/books/:id",
  asyncHandler(async (req, res) => {
    const books = await Book.findByPk(req.params.id);

    await books.update(req.body);
    console.log(req.body);
    res.redirect("/books/page/1");
  })
);

/*Deletes a book. Careful, this can’t be undone. It can be helpful to create a new “test” book to test deleting. */
app.post(
  "/books/:id/delete",
  asyncHandler(async (req, res) => {
    const books = await Book.findByPk(req.params.id);
    await books.destroy();
    res.redirect("/");
  })
);

app.use((req, res, next) => {
  console.log("404 error handler called");

  res.status(404).render("page-not-found");
});

app.use((err, req, res, next) => {
  if (err) {
    console.log("Global error handler called", err);
  }
  if (err.status === 404) {
    res.status(404).render("page-not-found", { err });
  } else {
    err.message =
      "It looks like something went wrong or the resource you are looking for does not exist";
    res.status(err.status || 500).render("error", { err });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("listening on port 3000");
});
