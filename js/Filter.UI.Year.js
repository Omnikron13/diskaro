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
            //Init (empty) Filter obj
            .data('filter', Filter.Year(null, null))
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
                //Store new start year (or null it)
                if(y) $(this).data('start', y);
                else $(this).removeData('start');
                //Get stored Filter obj
                var f = $(this).data('filter');
                //Update Filter obj
                f.start = y;
                $(this)
                    //Trigger filterUpdate to alert parents
                    .trigger('filterUpdate', f.start ? f : null)
                    //Trigger validate to recheck .invalid flags
                    .trigger('validate')
                ;
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
                //Update Filter obj
                f.end = y;
                $(this)
                    //Trigger filterUpdate to alert parents
                    .trigger('filterUpdate', f.start ? f : null)
                    //Trigger validate to recheck .invalid flags
                    .trigger('validate')
                ;
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
