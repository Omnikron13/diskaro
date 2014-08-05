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
                        .addClass('header')
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
                        //Add class for unambiguous selection
                        .addClass('options')
                        .append(
                            $('<legend>')
                                //Add class for unambiguous selection
                                .addClass('header')
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
                //Find option container element
                o = e.children('.options')
                    .find('.filterOption-' + o);
                //Process checkbox options
                if(o.hasClass('optionCheckbox'))
                    return o.find('input').is(':checked');
                //Process radio options
                if(o.hasClass('optionRadio'))
                    return o.find(':checked').val();
                //Process all other options
                return o.find('input').val();
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
                .addClass('optionCheckbox')
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
        },

        //Utility function for generating radio buttons for Filter options
        optionRadio: function(prefix, name, buttons) {
            return $('<fieldset>')
                //Set classes
                .addClass('option')
                .addClass('optionRadio')
                .addClass('filterOption-' + name)
                //Render buttons from buttons - array of value/label strings
                .append(
                    $.map(buttons, function(b, i) {
                        return [
                            $('<input>')
                                .attr('id', prefix + 'FilterOption-' + name + '-' + i)
                                .attr('type', 'radio')
                                .attr('name', prefix + name)
                                .val(b.value)
                            ,
                            $('<label>')
                                .attr('for', prefix + 'FilterOption-' + name + '-' + i)
                                .html(b.label)
                        ];
                    })
                )
            ;
        },
    }
};
