const express = require("express");
//const router = express.Router();
const db = require("./db");
const { Book } = db.models;

const app = express();

app.set("view engine", "pug");

//routes

/* Home route should redirect to the /books route.*/
app.get("/", (req, res) => {
  res.send("<h1>Test home</h1>");
});

/*Shows the full list of books */
app.get("/books", (req, res) => {
  res.send("<h1>Test books</h1>");
});

/* Shows the create new book form*/
app.get("/books/new", (req, res) => {
  res.send("<h1>Test new books</h1>");
});

/*Posts a new book to the database. */
app.post("/books/new", (req, res) => {
  res.send("<h1>Test home</h1>");
});

/* Shows book detail form*/
app.get("/books/:id", (req, res) => {
  res.send("<h1>Test books id</h1>");
});

/* Updates book info in the database*/
app.post("/books/:id", (req, res) => {
  res.send("<h1>Test home</h1>");
});

/*Deletes a book. Careful, this can’t be undone. It can be helpful to create a new “test” book to test deleting. */
app.post("/books/:id/delete", (req, res) => {
  res.send("<h1>Test home</h1>");
});

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
