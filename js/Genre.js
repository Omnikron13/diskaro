//require_once(CrockfordSugar.js)
//require_once(Request.js)

function Genre(json) {
    this.id = json.id;
    this.name = json.name;
    this.parentIDs = json.parentIDs;
};

//Render the Genre as an <li> DOM element
Genre.method('renderLI', function() {
    return $('<li>')
        .addClass('genreItem')
        .html(this.name)
    ;
});

//Shorthand for using Request.load() to load Genre data
Genre.load = function(cb, f) {
    return Request.load('Genre', cb, f);
};
