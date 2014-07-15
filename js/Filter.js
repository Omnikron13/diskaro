//require_once(CrockfordSugar.js)

function Filter(type, negate) {
    this.type = type;
    this.negate = typeof negate=='undefined'?false:negate;
};

//
Filter.method('encode', function() {
    return JSON.stringify({
        'class': this.type,
        'data' : JSON.stringify(this.getData())
    });
});

//Static method to create arbitrary DataFilter objects
Filter.data = function(type, data, recursive, negate) {
    var f = new Filter(type, negate);
    f.data = data;
    f.recursive = typeof recursive=='undefined'?false:recursive;
    //f.negate = negate;
    f.getData = function() {
        return {
            id: this.data.id,
            recursive: this.recursive,
            negate: this.negate
        };
    };
    return f;
};

//Static method to create RegexFilter objects
Filter.Regex = function(regex, negate) {
    var f = new Filter('RegexFilter', negate);
    f.regex = regex;
    f.getData = function() {
        return {
            regex: this.regex,
            negate: this.negate
        };
    };
    return f;
};

//Static method to create CompoundFilter objects
Filter.Compound = function(filters, operator, negate) {
    var f = new Filter('CompoundFilter', negate);
    f.filters = filters;
    f.operator = operator;
    f.getData = function() {
        return {
            filters: this.filters.map(function(x, i) {
                return x.encode();
            }),
            operator: this.operator,
            negate: this.negate
        };
    };
    return f;
};

//Shorthand to create GenreFilter objects
Filter.Genre = function(g, r, n) {
    return Filter.data('GenreFilter', g, r, n);
};

//Shorthand to create ArtistFilter objects
Filter.Artist = function(a, r, n) {
    return Filter.data('ArtistFilter', a, r, n);
};

//Shorthand to create ReleaseFilter objects
Filter.Release = function(rel, r, n) {
    return Filter.data('ReleaseFilter', rel, r, n);
};

//Shorthand to create RoleFilter objects
Filter.Role = function(role, r, n) {
    return Filter.data('RoleFilter', role, r, n);
};
