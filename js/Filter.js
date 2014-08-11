//require_once(CrockfordSugar.js)

function Filter(type, negate) {
    //Set common properties
    this.type = type;
    this.negate = typeof negate=='undefined'?false:negate;
    //Fallback method to generate generic human-readable version
    this.toString = function() {
        return (this.negate?'!':'')
            + _(this.type)
        ;
    };
};

//Encode the filter as JSON in a format understood by Filter::load()
Filter.method('encode', function() {
    return JSON.stringify({
        'class': this.type,
        'data' : JSON.stringify(this.getData())
    });
});

//Convert the filter to a constraint understood by DataCore::jsonRequest()
Filter.method('constraint', function() {
    return {
        type: 'filter',
        data: this.encode()
    };
});

//Static method to create arbitrary DataFilter objects
Filter.data = function(type, data, recursive, negate) {
    var f = new Filter(type, negate);
    f.data = data;
    f.recursive = recursive || false;
    //Method to generate plain obj version for JSON encoding
    f.getData = function() {
        return {
            id: this.data.id,
            recursive: this.recursive,
            negate: this.negate
        };
    };
    //Method to generate human-readable version of the Filter
    f.toString = function() {
        return _(data.type)
            + ': '
            + (f.negate?'!':'')
            + f.data.name
            + (f.recursive?'*':'')
        ;
    };
    return f;
};

//Static method to create RegexFilter objects
Filter.Regex = function(regex, negate) {
    var f = new Filter('RegexFilter', negate);
    f.regex = regex;
    //Method to generate plain obj version for JSON encoding
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
    //Method to generate plain obj version for JSON encoding
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

//Shorthand to create TagFilter objects
Filter.Tag = function(t, r, n) {
    return Filter.data('TagFilter', t, r, n);
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
