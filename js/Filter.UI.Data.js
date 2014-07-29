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
            //Add main DataList selection element
            .append(
                DataList.UI.Buttonset.render(
                    dl,
                    prefix
                )
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
    }
};
