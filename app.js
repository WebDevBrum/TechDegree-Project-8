const express = require("express");
const bodyParser = require("body-parser");
//const router = express.Router();
const db = require("./db");
const { Book } = db.models;

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
    const books = await Book.findAll();
    res.render("index", { books: books, title: "Library Manager" });
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
    const books = await Book.create(req.body);
    res.redirect("/books/");
  })
);

/* Shows book detail form*/
app.get(
  "/books/:id",
  asyncHandler(async (req, res) => {
    const books = await Book.findByPk(req.params.id);

    res.render("update-book", { books: books });
  })
);

/* Updates book info in the database*/
app.post(
  "/books/:id",
  asyncHandler(async (req, res) => {
    const books = await Book.findByPk(req.params.id);
    console.log(books.title);

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

app.listen(process.env.PORT || 3000, () => {
  console.log("listening on port 3000");
});
