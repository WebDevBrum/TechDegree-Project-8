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

//routes

/* Home route should redirect to the /books route.*/
app.get(
  "/",
  asyncHandler(async (req, res) => {
    res.redirect("/books"); //think i need to set up view templates first and then delete these res.sends, also have console.log for library items
  })
);

/*Shows the full list of books */
app.get(
  "/books",
  asyncHandler(async (req, res) => {
    let page = 0;
    let page_size = 5;
    const offset = page * page_size;
    const { count, rows } = await Book.findAndCountAll({
      where: { id: { [Op.gte]: 0 } },
      offset: offset,
      limit: page_size,
    });
    console.log(count);
    let numberOfPages = count / page_size;
    console.log(numberOfPages);
    res.render("index", { books: rows, title: "Library Manager" });
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
      res.redirect("/books/");
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
    res.redirect("/books/");
  })
);

/*Deletes a book. Careful, this can’t be undone. It can be helpful to create a new “test” book to test deleting. */
app.post(
  "/books/:id/delete",
  asyncHandler(async (req, res) => {
    const books = await Book.findByPk(req.params.id);
    await books.destroy();
    res.redirect("/books/");
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
      "It looks like something went wrong or the book you are looking for does not exist";
    res.status(err.status || 500).render("error", { err });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("listening on port 3000");
});
