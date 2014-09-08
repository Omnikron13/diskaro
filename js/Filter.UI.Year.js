//require_once(Filter.UI.js)

//Namespace for Filter.Year UI elements
Filter.UI.Year = {
    //Default UI strings
    yearsHeader      : _('Start/End Years'),
    startLabel       : _('Start'),
    startPlaceholder : _('Start') + '...',
    endLabel         : _('End'),
    endPlaceholder   : _('End') + '...',

    //Function for creating YearFilter/Filter.Year UI elements
    render: function(prefix) {
        //Create element from base template
        return Filter.UI.core.render(
            'Year',
            null,
            prefix
        )
            //Add year specific UI fields/controls
            .append(
                $('<fieldset>')
                    //Add class for generic selection (e.g. .filter>.body)
                    .addClass('body')
                    //Add class for specific selection (e.g. .yearFilter>.body.years)
                    .addClass('years')
                    //Render section header element
                    .append(
                        $('<legend>')
                            //Add class for generic selection (e.g. .filter>.body>.header)
                            .addClass('header')
                            .html(Filter.UI.Year.yearsHeader)
                    )
                    //Render start year input label
                    .append(
                        $('<label>')
                            .attr('for', 'startField')
                            .html(Filter.UI.Year.startLabel)
                    )
                    //Render start year input field
                    .append(
                        $('<input>')
                            .addClass('start')
                            .attr('name', 'startField')
                            .attr('type', 'number')
                            .attr('placeholder', Filter.UI.Year.startPlaceholder)
                            //Catch /actual/ changes to the field
                            .on('input', function() {
                                var y = $(this).val();
                                $(this).trigger('updateStart', Number.parseInt(y, 10) || null);
                            })
                    )
                    //Render end year input label
                    .append(
                        $('<label>')
                            .attr('for', 'endField')
                            .html(Filter.UI.Year.endLabel)
                    )
                    //Render end year input field
                    .append(
                        $('<input>')
                            .addClass('end')
                            .attr('name', 'endField')
                            .attr('type', 'number')
                            .attr('placeholder', Filter.UI.Year.endPlaceholder)
                            //Catch /actual/ changes to the field
                            .on('input', function() {
                                var y = $(this).val();
                                $(this).trigger('updateEnd', Number.parseInt(y, 10) || null);
                            })
                    )
            )

            //Catch start year updates
            .on('updateStart', function(ev, y) {
                //Start year has been nulled
                if(!y) {
                    $(this)
                        //Null stored Filter obj
                        .removeData('filter')
                        //Alert parents that Filter is nulled
                        .trigger('filterUpdate', null)
                    ;
                    //Stop propagation
                    return false;
                }
                //Get stored Filter obj
                var f = $(this).data('filter');
                //No filter stored; create one
                if(!f) f = $(this).data(
                    'filter',
                    Filter.Year(
                        y,
                        $(this).data('end'),
                        $(this).data('options')['Negate']
                    )
                ).data('filter');
                //Filter obj was stored; update it
                else f.start = y;
                //Trigger filterUpdate to alert parents
                $(this).trigger('filterUpdate', f);
                //Stop propagation
                return false;
            })

            //Catch end year updates
            .on('updateEnd', function(ev, y) {
                //Store new end year (or null it)
                if(y) $(this).data('end', y);
                else $(this).removeData('end');
                //Get stored Filter obj
                var f = $(this).data('filter');
                //Abort if there isn't a Filter to update
                if(!f) return false;
                //Update Filter obj
                f.end = y;
                //Trigger filterUpdate to alert parents
                $(this).trigger('filterUpdate', f);
                //Stop propagation
                return false;
            })

            //Event to check/update .invalid class flags
            .on('validate', function() {
                //Get stored Filter obj
                var f = $(this).data('filter');
                //End field is empty/null
                if(!f.end) {
                    //Remove any/all .invalid flags
                    $(this).find('input').removeClass('invalid');
                    //Skip further checks
                    return false;
                }
                //Check/update on input.start
                if(!f.start)
                    $(this).find('input.start').addClass('invalid');
                else
                    $(this).find('input.start').removeClass('invalid');
                //Check/update on input.end
                if(!f.getEnd())
                    $(this).find('input.end').addClass('invalid');
                else
                    $(this).find('input.end').removeClass('invalid');
                //Stop propagation
                return false;
            })
        ;
    },
};

