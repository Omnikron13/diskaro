//require_once(Filter.js)
//require_once(DataList.UI.js)

//Namespace for Filter UI elements
Filter.UI = {
    //Subnamespace for common functionality
    core: {
        //Function for creating core (empty) Filter UI elements
        render: function(type, options, prefix) {
            var e = $('<fieldset>')
                .addClass('filter')
                .addClass(type.toLowerCase() + 'Filter')
                .append(
                    $('<legend>')
                        .html(type + 'Filter')
                )
                //Options section
                .append(
                    $('<fieldset>')
                        .addClass('options')
                        .append(
                            $('<legend>')
                                .html('Options')
                        )
                        .append(
                            $('<input>')
                                .attr('id', prefix + type + 'FilterNegate')
                                .attr('type', 'checkbox')
                        )
                        .append(
                            $('<label>')
                                .attr('for', prefix + type + 'FilterNegate')
                                .html('Negate')
                        )
                        .append(options)
                        .buttonset()
                )
            ;
            //Method to check if the filter should be negated
            e.isNegated = function() {
                return e.find('#' + prefix + type + 'FilterNegate')
                    .is(':checked');
            //Method to check the value of a UI option
            e.getOption = function(o) {
                var i = e.find('.options>.filterOption-' + o + ' input');
                if(i.attr('type') == 'checkbox')
                    return i.is(':checked');
                return i.val();
            };
            return e;
        },

        //Utility function for generating checkboxes for Filter options
        optionCheckbox: function(prefix, name, label) {
            label = label || name;
            return $('<span>')
                .addClass('option')
                .addClass('filterOption-' + name)
                .append(
                    $('<input>')
                        .attr('id', prefix + 'FilterOption-' + name)
                        .attr('type', 'checkbox')
                )
                .append(
                    $('<label>')
                        .attr('for', prefix + 'FilterOption-' + name)
                        .html(label)
                )
            ;
        }
    },

    //Subnamespace for Data[List] Filter UI elements (e.g. GenreFilter)
    Data: {
        //Function for creating Data[List] UI elements of arbitrary type
        render: function(dl, prefix) {
            //Create element from base template
            var e = Filter.UI.core.render(
                dl.type,
                Filter.UI.Data.getOptions(prefix, dl.type),
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
                    Filter[dl.type]({id: id}, e.isRecursive(), e.isNegated());
            };
            return e;
        },

        //Function to generate additional filter options
        getOptions: function(prefix, type) {
            return [
                $('<input>')
                    .attr('id', prefix + type + 'FilterRecursive')
                    .attr('type', 'checkbox'),
                $('<label>')
                    .attr('for', prefix + type + 'FilterRecursive')
                    .html('Recursive')
            ];
        }
    }
};
