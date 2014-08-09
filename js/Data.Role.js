//require_once(Data.js)

//Pseudo-constructor for creating role Data objects
Data.Role = function(json) {
    var r = new Data('Role', json);
    return r;
};

//Shorthand for using Data.load() to load roles
Data.Role.load = function(cb, f) {
    return Data.load('Role', cb, f);
};
