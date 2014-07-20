//require_once(CrockfordSugar.js)
//require_once(Filter.js)
//require_once(DataList.js)
//require_once(Request.js)

//Base function for creating (empty) QuickFilter elements
function QuickFilter(head) {
    return $('<div>')
        .addClass('quickFilter')
        .append(
            $('<header>')
                .append(
                    $('<h1>')
                    .html(head)
                )
        )
    ;
};

//Static method for generating simple QuickFilter elements that filter by
//given type (which can be Genre, Artist, Release, etc.)
QuickFilter.data = function(type, cb) {
    var qf = QuickFilter('Quick '+type+' Filter');
    Request.load(type, function(d) {
        qf.append(
            new DataList(type, d)
                .addCallback('itemClick', function(d) {
                    cb(Filter[type](d));
                })
                .renderUL()
        );
    });
    return qf;
};

//Shorthand static methods for creating some simple QuickFilters
QuickFilter.Genre = function(cb) {
    return QuickFilter.data('Genre', cb);
};

QuickFilter.Release = function(cb) {
    return QuickFilter.data('Release', cb);
};
