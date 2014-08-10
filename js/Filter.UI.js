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
                        .html(_(type + ' Filter'))
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
                                .html(_('Options'))
                        )
                        .append(Filter.UI.core.optionCheckbox(prefix, 'Negate', _('Negate')))
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
                return e.find('.options .filterOption-'+o)
                    .data('value');
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
                //Add generic, semi-specific & very specific classes
                .addClass('option')
                .addClass('optionCheckbox')
                .addClass('filterOption-' + name)
                //Set default value/state
                .data('value', false)
                //Render actual control & label
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
                //Store option value/state on changes
                .on('change', function() {
                    $(this).data('value', $(this).find('input').is(':checked'));
                    //Trigger custom event & pass the handler internal option name
                    $(this).trigger('optionUpdate', name);
                })
            ;
        },

        //Utility function for generating radio buttons for Filter options
        optionRadio: function(prefix, name, buttons, header) {
            //Set defaults - header same as name if not specified
            header = header || name;
            return $('<fieldset>')
                //Set classes
                .addClass('option')
                .addClass('optionRadio')
                .addClass('filterOption-' + name)
                //Render header/legend
                .append(
                    $('<legend>')
                        .addClass('header')
                        .html(header)
                )
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
                //Store option value/state on changes
                .on('change', function() {
                    $(this).data('value', $(this).find(':checked').val());
                    //Trigger custom event & pass the handler internal option name
                    $(this).trigger('optionUpdate', name);
                })
            ;
        },
    }
};
