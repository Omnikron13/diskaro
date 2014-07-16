//require_once(CrockfordSugar.js)
//require_once(Request.js)

function Genre(json) {
    this.id = json.id;
    this.name = json.name;
    this.parentIDs = json.parentIDs;
};

//Static method which requests an (optionally filtered) list of genres from
//the DB and passes a list of Genre objects to the provided callback
Genre.load = function(cb, f) {
    return new Request('Genre', f?f.constraint():null)
        .pull(function(json) {
            cb(json.map(function(g) {
                return new Genre(g);
            }));
        })
    ;
};
