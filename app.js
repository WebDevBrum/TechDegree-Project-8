const express = require("express");
//const router = express.Router();
const db = require("./db");
const { Book } = db.models;

const app = express();

app.set("view engine", "pug");
app.use("/static", express.static("public"));

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
    // console.log(books[0].title);
    // console.log(books[0].author);
    // console.log(books[0].genre);
    // console.log(books[0].year);

    res.render("index", { books: books, title: "Library Manager" });
  })
);

/* Shows the create new book form*/
app.get(
  "/books/new",
  asyncHandler(async (req, res) => {
    res.send("<h1>Test new books</h1>");
  })
);

/*Posts a new book to the database. */
app.post(
  "/books/new",
  asyncHandler(async (req, res) => {
    res.send("<h1>Test home</h1>");
  })
);

/* Shows book detail form*/
app.get(
  "/books/:id",
  asyncHandler(async (req, res) => {
    res.send("<h1>Test books id</h1>");
  })
);

/* Updates book info in the database*/
app.post(
  "/books/:id",
  asyncHandler(async (req, res) => {
    res.send("<h1>Test home</h1>");
  })
);

/*Deletes a book. Careful, this can’t be undone. It can be helpful to create a new “test” book to test deleting. */
app.post(
  "/books/:id/delete",
  asyncHandler(async (req, res) => {
    res.send("<h1>Test home</h1>");
  })
);

/* 

At the very least, you will need the following routes:

get / - Home route should redirect to the /books route.
get /books - Shows the full list of books.
get /books/new - Shows the create new book form.
post /books/new - Posts a new book to the database.
get /books/:id - Shows book detail form.
post /books/:id - Updates book info in the database.
post /books/:id/delete - Deletes a book. Careful, this can’t be undone. It can be helpful to create a new “test” book to test deleting.





**/

app.listen(process.env.PORT || 3000, () => {
  console.log("listening on port 3000");
});
