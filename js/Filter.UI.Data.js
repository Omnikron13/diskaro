//require_once(Filter.UI.js)

//Subnamespace for Data[List] Filter UI elements (e.g. GenreFilter)
Filter.UI.Data = {
    //Function for creating Data[List] UI elements of arbitrary type
    render: function(dl, prefix) {
        //Create element from base template
        var e = Filter.UI.core.render(
            dl.type,
            Filter.UI.core.optionCheckbox(prefix, 'Recursive'),
            prefix
        )
            //Add generic filter type class
            .addClass('dataFilter')
            //Add search section element
            .append(Filter.UI.Data.renderSearch())
            //Add main DataList selection element
            .append(
                DataList.UI.Buttonset.render(
                    dl,
                    prefix
                )
                    //Add class for generic selection (e.g. .filter>.body)
                    .addClass('body')
                    //Add class for specific selection (e.g. .dataFilter>.body.buttons)
                    .addClass('buttons')
            )
            //Store human-readable filterStr on changes
            .on('change', function() {
                var s =
                    e.find('.dataButtonset .ui-button.ui-state-active>.ui-button-text')
                        .html()
                ;
                if(e.getOption('Negate')) s = '!' + s;
                if(e.getOption('Recursive')) s += '*';
                e.data('filterStr', s);
            })
        ;
        //Add method to check recursive option
        e.isRecursive = function() {
            return e.find('#' + prefix + dl.type + 'FilterRecursive')
                .is(':checked');
        };
        //Add method to get Filter object
        e.getFilter = function() {
            var id = e
                .find('.dataButtonset :radio:checked')
                    .val()
            ;
            return typeof id === 'undefined'?
                null:
                Filter[dl.type]({id: id}, e.getOption('Recursive'), e.getOption('Negate'));
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
                    .html('Search')
            )
            //Render field label
            .append(
                $('<label>')
                    .attr('for', 'search')
                    .html('Search')
            )
            //Render actual search box/field
            .append(
                $('<input>')
                    .attr('type', 'search')
                    .attr('name', 'search')
                    .attr('placeholder', 'Search...')
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
