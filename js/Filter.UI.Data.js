//require_once(Filter.UI.js)

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
            //Add search section element
            .append(Filter.UI.Data.renderSearch())
            //Add placeholder for main DataList selection element
            .append(
                $('<p>')
                    //Add class for generic placeholder selection
                    .addClass('placeholder')
                    //Add class for specific selection (e.g. for replacing)
                    .addClass('buttons')
                    .html(_(type + ' list loading') + '...')
            )
            //Store human-readable filterStr on filter changes
            .on('filterUpdate', function() {
                //Abort string generation if no Data obj selected
                if(typeof e.data('data') === 'undefined') return;
                //Generate string
                var s = e.data('data').name;
                if(e.data('options')['Negate']) s = '!' + s;
                if(e.data('options')['Recursive']) s += '*';
                e.data('filterStr', s);
            })
            //Catch option value/state changes
            .on('optionUpdate', function(ev, name) {
                //Check for Recursive change & existing Filter obj
                if(name == 'Recursive' && $(this).data('filter')) {
                    //Update stored filter
                    $(this).data('filter').recursive = $(ev.target).data('value');
                    //Trigger custom event to indicate .data('filter') change
                    $(this).trigger('filterUpdate');
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
                            $(this).parents('.dataFilter')
                                .data('data', $(this).data('data'));
                            //Check for stored Filter obj
                            if($(this).parents('.dataFilter').data('filter')) {
                                //Stored filter exists; update it
                                $(this).parents('.dataFilter')
                                    .data('filter').data = $(this).data('data');
                            } else {
                                //Stored filter doesn't exist; create it
                                $(this).parents('.dataFilter')
                                    .data(
                                        'filter',
                                        Filter[type](
                                            e.data('data'),
                                            e.data('options').Recursive,
                                            e.data('options').Negate
                                        )
                                    );
                            }
                            //Trigger custom event to indicate .data('filter') change
                            $(this).trigger('filterUpdate');
                        })
                )
            ;
        });
        //Add method to get Filter object
        e.getFilter = function() {
            return typeof e.data('data') === 'undefined'?
                null:
                Filter[type](e.data('data'), e.getOption('Recursive'), e.getOption('Negate'));
        };
        return e;
    },

    //Render a search section/field for filtering the DataList.UI Buttons
    renderSearch: function() {
        return $('<fieldset>')
            //Add class for generic selection (e.g. .dataFilter>.search)
            .addClass('search')
            //Render legend/header
            .append(
                $('<legend>')
                    .addClass('header')
                    .html(Filter.UI.Data.searchHeaderStr)
            )
            //Render field label
            .append(
                $('<label>')
                    .attr('for', 'search')
                    .html(Filter.UI.Data.searchLabelStr)
            )
            //Render actual search box/field
            .append(
                $('<input>')
                    .attr('type', 'search')
                    .attr('name', 'search')
                    .attr('placeholder', Filter.UI.Data.searchPlaceholderStr)
                    //Show/Hide DataList Buttons on search string changes
                    .on('input', function() {
                        //Create regex from entered string
                        var regex = new RegExp($(this).val(), 'i');
                        //Find button elements & iterate
                        $(this).parents('.dataFilter')
                            .find('.body.buttons>.dataRadio')
                                .each(function() {
                                    //Show/Hide based on regex match
                                    if(regex.test($(this).find('.ui-button-text').html()))
                                        $(this).show();
                                    else
                                        $(this).hide();
                                })
                        ;
                    })
            )
        ;
    },
};
