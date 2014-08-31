//require_once(Filter.UI.js)
//require_once(DataList.All.js)

//Subnamespace for Data[List] Filter UI elements (e.g. GenreFilter)
Filter.UI.Data = {
    //Default recursive option human name
    recursiveStr: _('Recursive'),

    //Default UI strings for search section
    searchHeaderStr     : _('Search'),
    searchLabelStr      : _('Search'),
    searchPlaceholderStr: _('Search') + '...',

    //Function for creating Data[List] UI elements of arbitrary type
    render: function(type, prefix) {
        //Create element from base template
        var e = Filter.UI.core.render(
            type,
            Filter.UI.core.optionCheckbox(prefix, 'Recursive', Filter.UI.Data.recursiveStr),
            prefix
        )
            //Add generic filter type class
            .addClass('dataFilter')
            //Add placeholder for main DataList selection element
            .append(
                $('<p>')
                    //Add class for generic placeholder selection
                    .addClass('placeholder')
                    //Add class for specific selection (e.g. for replacing)
                    .addClass('buttons')
                    .html(_(type + ' list loading') + '...')
            )
            //Catch option value/state changes
            .on('optionUpdate', function(ev, name, val) {
                //Check for Recursive change & existing Filter obj
                if(name == 'Recursive' && $(this).data('filter')) {
                    //Update stored filter
                    $(this).data('filter').recursive = val;
                    //Trigger custom event to indicate .data('filter') change
                    $(this).trigger('filterUpdate', $(this).data('filter'));
                }
            })
        ;
        //Replace placeholder when complete DataList of [type] is loaded
        $.when(DataList.All.loaded(type)).done(function() {
            e.find('.placeholder.buttons')
                .replaceWith(
                    DataList.UI.Buttonset.render(DataList.All[type], prefix)
                        //Add class for generic selection (e.g. .filter>.body)
                        .addClass('body')
                        //Add class for specific selection (e.g. .dataFilter>.body.buttons)
                        .addClass('buttons')
                        //Catch radio/data selection
                        .on('change', function() {
                            //Store Data obj in main element
                            e.data('data', $(this).data('data'));
                            //Check for stored Filter obj
                            if(e.data('filter')) {
                                //Stored filter exists; update it
                                e.data('filter').data = $(this).data('data');
                            } else {
                                //Stored filter doesn't exist; create it
                                e.data(
                                    'filter',
                                    Filter[type](
                                        e.data('data'),
                                        e.data('options').Recursive,
                                        e.data('options').Negate
                                    )
                                );
                            }
                            //Trigger custom event to indicate .data('filter') change
                            $(this).trigger('filterUpdate', e.data('filter'));
                        })
                )
            ;
        });
        return e;
    },
};
