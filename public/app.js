$(document).on("click", ".scrape", function () {
  // This function handles the user clicking "scrape new articles" button
  $.get("/scrape").then(function () {
    location.reload();
  });
});
//This function handles the user clicking the "save article" button
$(document).on("click", ".save", function (event) {
  M.toast({ html: 'Article saved!' });
  var thisId = $(this).attr("data-id");
  $.ajax({
    type: "GET",
    url: "/save/" + thisId
  });
});
//This function handles the user clicking the "delete article" button
$(document).on("click", ".unsave", function (event) {
  var thisId = $(this).attr("data-id");
  $.ajax({
    type: "GET",
    url: "/unsave/" + thisId
  });
  location.reload();
});


// Whenever someone clicks an add note button
$(document).on("click", ".note-btn", function () {
  // Save the id
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/api/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
      $("#notes-card").empty();
      $(".collection").empty();
      // The title of the article
      $("#notes-card").append("<h5>" + data.title + "</h5>");
      // A textarea to add a new note body
      $("#notes-card").append("<textarea class='materialize-textarea' id='note-input' name='body'placeholder='Type your note here'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes-card").append("<a class='btn waves-effect waves-light amber right' data-id='"+ data._id +"' id='savenote'>Save Note</a>");

      // If there's a note in the article
      if (data.note) {

        // Place the body of the note in 
        $(".collection").append("<li class='collection-item'><span>" + data.note.body + "</span><a class='btn waves-effect waves-light amber right delete' data-id=' " + data.note._id + "'>Delete Note</a></li>")
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/api/articles/" + thisId,
    data: {
      // Value taken from note textarea
      body: $("#note-input").val()
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#note-input").val("");
  location.reload();

});

// When user clicks the delete button for a note
$(document).on("click", ".delete", function (event) {
  var thisId = $(this).attr("data-id").trim();
  $.ajax({
    type: "GET",
    url: "/delete/" + thisId
  }).then(function (data) {
    console.log(data);
    $(".list-item").html("");
  })
});
