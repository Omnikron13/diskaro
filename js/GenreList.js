//require_once(CrockfordSugar.js)
//require_once(Genre.js)

//Class for working with lists of Genre objects
function GenreList(genres) {
    this.list = genres;
    this.callbacks = {
        genreClick: []
    };
};

//Render the genres as a <ul> DOM element
GenreList.method('renderUL', function() {
    var that = this;
    return $('<ul>')
        .addClass('genreList')
        .append($.map(this.list, function(g, i) {
            return g.renderLI()
                .on('click', function() {
                    that.processCallbacks('genreClick', i);
                })
            ;
        }))
    ;
});

//Register a new callback function in the .callbacks array
GenreList.method('addCallback', function(e, cb) {
    this.callbacks[e].push(cb);
    return this;
});

//Process the registered callbacks for a given event, passing each a Genre
//object and the internal index of the object
GenreList.method('processCallbacks', function(e, i) {
    var that = this;
    this.callbacks[e].forEach(function(cb) {
        cb(that.list[i], i);
    });
    return this;
});
