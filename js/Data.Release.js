//require_once(Data.js)

//Pseudo-constructor for creating release Data objects
Data.Release = function(json) {
    var r = new Data('Release', json);
    r.year = json.year;
    r.label = json.label===null?null:new Label(json.label);
    return r;
};

//Shorthand for using Data.load() to load releases
Data.Release.load = function(cb, f) {
    return Data.load('Release', cb, f);
};
