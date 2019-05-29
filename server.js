var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
  })
);
app.set("view engine", "handlebars");

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes
app.get("/", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.render("index", {
        title: "Mongo Runners",
        articles: dbArticle
      });
    });
});
app.get("/saved", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.render("saved", {
        title: "Saved Articles",
        articles: dbArticle,
      });
    });
});
app.get("/notes", function (req, res) {
  db.Notes.find({})
    .then(function (dbNotes) {
      res.render("notes", {
        notes: dbNotes
      });
    });
});

// A GET route for scraping the website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://www.runnersworld.com/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every item-title within an article tag, and do the following:
    $("div.simple-item").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a.item-title").text()
      result.link = "www.runnersworld.com/" + $(this)
        .children("a.item-title").attr("href");
      result.summary = $(this)
        .children("div.item-dek").children("p").text();
      result.imageLink = $(this)
        .children("a.simple-item-image").children("picture.lazyimage").children("source").attr("data-srcset");
      console.log(result);
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result, { unique: true })
        .then(function (dbArticle) {

          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });
    // Send a message to the client
    res.send("Scrape Complete");
  });
});

//Route to save an article
app.get("/save/:id", function (req, res) {

  // Update a doc in the Article collection with an ObjectId matching
  // the id parameter in the url
  db.Article.update(
    {
      _id: req.params.id
    },
    {
      // Set "saved" to true for the article we specified
      $set: {
        saved: true
      }
    },
    // When that's done, run this function
    function (error, edited) {
      // show any errors
      if (error) {
        console.log(error);
        res.send(error);
      }
      else {
        // Otherwise, send the result of our update to the browser
        console.log(edited);
        res.send(edited);
      }
    }
  );
});

//Route to un-save an article
app.get("/unsave/:id", function (req, res) {

  // Update a doc in the Article collection with an ObjectId matching
  // the id parameter in the url
  db.Article.update(
    {
      _id: req.params.id
    },
    {
      // Set "saved" to true for the article we specified
      $set: {
        saved: false
      }
    },
    // When that's done, run this function
    function (error, edited) {
      // show any errors
      if (error) {
        console.log(error);
        res.send(error);
      }
      else {
        // Otherwise, send the result of our update to the browser
        console.log(edited);
        res.send(edited);
      }
    }
  );
});

// Route for getting all Articles from the db
app.get("/api/articles", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with its note
app.get("/api/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/api/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for getting all Notes from the db
app.get("/api/notes", function (req, res) {
  // Grab every document in the Articles collection
  db.Note.find({})
    .then(function (dbNote) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbNote);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
app.get("/delete/:id", function(req, res) {
  // Remove a note using the objectID
  db.Note.findOneAndRemove(
    {
      _id: req.params.id
    },
    function(error, removed) {
      // Log any errors from mongojs
      if (error) {
        console.log(error);
        res.send(error);
      }
      else {
        // Otherwise, send the mongojs response to the browser
        // This will fire off the success function of the ajax request
        console.log(removed);
        res.send(removed);
      }
    }
  );
});

// Render 404 page for any unmatched routes
// app.get("*", function (req, res) {
//   res.render("404");
// });

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
