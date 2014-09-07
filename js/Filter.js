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
    //Create base Filter obj
    var f = new Filter(type, negate);
    //Add specific properties
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
Filter.Regex = function(regex, caseSensitive, negate) {
    //Create base Filter obj
    var f = new Filter('RegexFilter', negate);
    //Add specific properties
    f.regex = regex;
    f.caseSensitive = caseSensitive || false;
    //Method to generate full regex str (with // & flags)
    f.genRegex = function() {
        return '/' + this.regex + '/' + (this.caseSensitive?'':'i');
    };
    //Method to generate plain obj version for JSON encoding
    f.getData = function() {
        return {
            regex: this.genRegex(),
            negate: this.negate
        };
    };
    //Method to generate human-readable version of the Filter
    f.toString = function() {
        return _('Regex')
            + ': '
            + (this.negate?'!':'')
            + this.genRegex()
        ;
    };
    return f;
};

//Static method to create CompoundFilter objects
Filter.Compound = function(filters, operator, negate) {
    //Create base Filter obj
    var f = new Filter('CompoundFilter', negate);
    //Add specific properties
    f.filters = filters;
    f.operator = operator;
    //Method to filter out empty/null filters
    f.getFilters = function() {
        return this.filters.filter(function(x) {
            return x;
        });
    }
    //Method to generate plain obj version for JSON encoding
    f.getData = function() {
        return {
            filters: this.getFilters().map(function(x) {
                return x.encode();
            }),
            operator: this.operator,
            negate: this.negate
        };
    };
    //Method to generate human-readable version of the Filter
    f.toString = function() {
        return _('Compound')
            + ': '
            + (this.negate?'!':'')
            + _(this.operator)
        ;
    };
    return f;
};

//Static method to create YearFilter objects
Filter.Year = function(start, end, negate) {
    //Create base Filter obj
    var f = new Filter('YearFilter', negate);
    //Add specific properties
    f.start = start;
    f.end   = end;
    //Method to generate plain obj version for JSON encoding
    f.getData = function() {
        return {
            start  : this.start,
            end    : this.end,
            negate : this.negate,
        };
    };
    //Method to generate human-readable version of the Filter
    f.toString = function() {
        return _('Year')
            + ': '
            + (this.negate?'!':'')
            + this.start
            + (this.end ? '-' + this.end : '')
        ;
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

//Shorthand to create LabelFilter objects
Filter.Label = function(l, r, n) {
    return Filter.data('LabelFilter', l, r, n);
};

//Shorthand to create RoleFilter objects
Filter.Role = function(role, r, n) {
    return Filter.data('RoleFilter', role, r, n);
};
