//require_once(CrockfordSugar.js)
//require_once(Filter.js)
//require_once(DataList.js)
//require_once(Request.js)

//Static property which defines which HTML tag a QuickFilter should be
QuickFilter.mainTag = '<div>';

//Base function for creating (empty) QuickFilter elements
function QuickFilter(name) {
    return $(QuickFilter.mainTag)
        .addClass('quickFilter')
        .attr('id', 'quickFilter'+name)
        .append(
            $('<header>')
                .append(
                    $('<h1>')
                        .html('QuickFilter: ')
                        .append(
                            $('<span>')
                                .addClass('quickFilterName')
                                .html(name)
                        )
                )
        )
    ;
};

//Static method for generating simple QuickFilter elements that filter by
//given type (which can be Genre, Artist, Release, etc.)
QuickFilter.data = function(type, cb) {
    var qf = QuickFilter(type);
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

//Static method for generating regex QuickFilter elements
QuickFilter.Regex = function(cb) {
    var qf = new QuickFilter('Regex');
    qf
        .append(
            $('<form>')
                .append(
                    $('<label>')
                        .attr('for', 'caseField')
                        .html('Case Sensitive')
                )
                .append(
                    $('<input>')
                        .attr('name', 'caseField')
                        .attr('type', 'checkbox')
                )
                .append(
                    $('<input>')
                        .attr('name', 'regexField')
                        .attr('type', 'search')
                        .attr('placeholder', 'Enter regex...')
                )
                .append(
                    $('<button>')
                        .attr('type', 'button')
                        .html('Filter')
                        .on('click', function() {
                            cb(Filter.Regex(
                                '/' + qf.find('[name="regexField"]').val() + '/'
                                + (qf.find('[name="caseField"]').is(':checked')?'':'i')
                            ));
                        })
                )
        )
    ;
    return qf;
};

//Shorthand static methods for creating some simple QuickFilters
QuickFilter.Genre = function(cb) {
    return QuickFilter.data('Genre', cb);
};

QuickFilter.Release = function(cb) {
    return QuickFilter.data('Release', cb);
};

//Shorthand static method to create an array of all predefined QuickFilters
QuickFilter.All = function(cb) {
    return [
        QuickFilter.Genre(cb),
        QuickFilter.Release(cb),
        QuickFilter.Regex(cb)
    ];
};
