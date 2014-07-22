//require_once(Data.js)

//Pseudo-constructor for creating genre Data objects
Data.Genre = function(json) {
    var g = new Data('Genre', json);
    g.parentIDs = json.parentIDs;
    return g;
};

//Shorthand for using Data.load() to load genres
Data.Genre.load = function(cb, f) {
    return Data.load('Genre', cb, f);
};
