$(document).on("click", "#scrape", function () {
  // This function handles the user clicking "scrape new articles" button
  $.get("/scrape").then(function () {
    location.reload();
  });
});
$(document).on("click", ".save", function (event) {
  M.toast({html: 'Article saved!'});
  var thisId = $(this).attr("data-id");
  $.ajax({
    type: "GET",
    url: "/save/" + thisId
  });
});

$(document).on("click", ".unsave", function (event) {
  var thisId = $(this).attr("data-id");
  $.ajax({
    type: "GET",
    url: "/unsave/" + thisId
  });
      location.reload();
});


// Whenever someone clicks a note button
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
      // The title of the article
      $("#notes").append("<h5>" + data.title + "</h5>");
      // A textarea to add a new note body
      $("#notes").append("<textarea class='materialize-textarea' id='note-input' name='body'></textarea>");
      $("#notes").append("<label for='note-input'>Type note above</label>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<a class='btn waves-effect waves-light amber right' data-id='" + data._id + "' id='savenote'>Save Note</a>");

      // If there's a note in the article
      if (data.note) {
        // Place the body of the note in the body textarea
        $("#saved-notes").val(data.note.body);
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
      // Empty the notes section
      $("#saved-notes").append(data.body);
      $("#note-input").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#note-input").val("");
});
