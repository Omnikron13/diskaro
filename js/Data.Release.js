//require_once(Data.js)
//require_once(Data.Label.js)

//Pseudo-constructor for creating release Data objects
Data.Release = function(json) {
    var r = new Data('Release', json);
    r.year = json.year;
    r.label = json.label===null?null:Data.Label(json.label);
    //Override generic .toJSON() from Data to include year & label
    r.toJSON = function() {
        return {
            id    : r.id,
            name  : r.name,
            year  : r.year,
            label : r.label,
        };
    };
    return r;
};

//Shorthand for using Data.load() to load releases
Data.Release.load = function(cb, f) {
    return Data.load('Release', cb, f);
};
