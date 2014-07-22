//require_once(Data.js)

//Pseudo-constructor for creating label Data objects
Data.Label = function(json) {
    var l = new Data('Label', json);
    return l;
};

//Shorthand for using Data.load() to load labels
Data.Label.load = function(cb, f) {
    return Data.load('Label', cb, f);
};
