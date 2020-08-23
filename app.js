const express = require("express");

const routes = require("./routes/index");
const books = require("./routes/books");

const app = express();

app.set("view engine", "pug");
app.use("/static", express.static("public"));

app.use("/", routes);
app.use("/books", books);

/*--- Error handling middleware function that returns a 404 status--- */
app.use((req, res, next) => {
  console.log("404 error handler called");

  res.status(404).render("page-not-found");
});

/*--- Global error handler---*/
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
