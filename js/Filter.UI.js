//require_once(Filter.js)
//require_once(DataList.UI.js)

//Namespace for Filter UI elements
Filter.UI = {
    //Subnamespace for common functionality
    core: {
        //Function for creating core (empty) Filter UI elements
        render: function(type, options, prefix) {
            var e = $('<fieldset>')
                .data('type', type)
                .addClass('filter')
                .addClass(type.toLowerCase() + 'Filter')
                .append(
                    $('<legend>')
                        .html(' Filter')
                        .prepend(
                            $('<span>')
                                .addClass('filterType')
                                .html(type)
                        )
                )
                //Options section
                .append(
                    $('<fieldset>')
                        .addClass('options')
                        .append(
                            $('<legend>')
                                .html('Options')
                        )
                        .append(Filter.UI.core.optionCheckbox(prefix, 'Negate'))
                        .append(options)
                        .buttonset()
                )
                //Update stored Filter on (bubbled) change events
                .on('change', function() {
                    e.data('filter', e.getFilter());
                })
            ;

            //Method to check the value of a UI option
            e.getOption = function(o) {
                var i = e.find('.options>.filterOption-' + o + ' input');
                if(i.attr('type') == 'checkbox')
                    return i.is(':checked');
                return i.val();
            };

            //'Abstract' method ensuring .getFilter calls always 'work'
            e.getFilter = function() {
                return null;
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
    }
};
