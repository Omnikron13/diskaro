//require_once(Data.js)

//Pseudo-constructor for creating tag Data objects
Data.Tag = function(json) {
    var tag = new Data('Tag', json);
    return tag;
};

//Shorthand for using Data.load() to load tags
Data.Tag.load = function(cb, f) {
    return Data.load('Tag', cb, f);
};

//Static method to create an empty Data.Tag obj
Data.Tag.New = function(name) {
    return Data.Tag({
        name      : name,
        parentIDs : [],
        childIDs  : [],
    });
};
