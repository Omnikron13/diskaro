//require_once(Data.js)

//Pseudo-constructor for creating artist Data objects
Data.Artist = function(json) {
    var a = new Data('Artist', json);
    return a;
};

//Shorthand for using Data.load() to load artists
Data.Artist.load = function(cb, f) {
    return Data.load('Artist', cb, f);
};
