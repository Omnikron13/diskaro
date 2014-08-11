//require_once(Filter.UI.js)

//Namespace for regex filter UI elements
Filter.UI.Regex = {
    //Input type for the regex field tag (probably text or search)
    fieldType: 'search',

    //Default UI strings
    caseSensitiveStr   : _('Case Sensitive'),
    regexHeaderStr     : _('Regex'),
    regexLabelStr      : _('Regex'),
    regexPlaceholderStr: _('Enter regex') + '...',

    //Function for creating RegexFilter/Filter.Regex UI elements
    render: function(prefix) {
        //Create element from base template
        var e = Filter.UI.core.render(
            'Regex',
            Filter.UI.core.optionCheckbox(prefix, 'CaseSensitive', Filter.UI.Regex.caseSensitiveStr),
            prefix
        )
            //Add regex specific UI fields/controls
            .append(
                $('<fieldset>')
                    //Add class for generic selection (e.g. .filter>.body)
                    .addClass('body')
                    //Add class for specific selection (e.g. .regexFilter>.body.regex)
                    .addClass('regex')
                    .append(
                        $('<legend>')
                            //Add class for generic selection (e.g. .filter>.body>.header)
                            .addClass('header')
                            .html(Filter.UI.Regex.regexHeaderStr)
                    )
                    .append(
                        $('<label>')
                            .attr('for', 'regexField')
                            .html(Filter.UI.Regex.regexLabelStr)
                    )
                    .append(
                        $('<input>')
                            .addClass('regexField')
                            .attr('name', 'regexField')
                            .attr('type', Filter.UI.Regex.fieldType)
                            .attr('placeholder', Filter.UI.Regex.regexPlaceholderStr)
                            //Catch /actual/ changes to the regex input
                            .on('input', function() {
                                //Store raw (without // or flags) regex
                                e.data('regex', $(this).val());
                                //Check if Filter obj is stored already
                                if(e.data('filter')) {
                                    //Filter obj exists; update regex
                                    e.data('filter').regex = e.data('regex');
                                } else {
                                    //Filter obj doesn't exist; create it
                                    e.data(
                                        'filter',
                                        Filter.Regex(
                                            e.data('regex'),
                                            e.data('options')['CaseSensitive'],
                                            e.data('options')['Negate']
                                        )
                                    );
                                }
                                e.trigger('filterUpdate');
                            })
                    )
            )
            //Catch option value/state changes
            .on('optionUpdate', function(ev, name, val) {
                //Check for CaseSensitive change & existing Filter obj
                if(name == 'CaseSensitive' && $(this).data('filter')) {
                    //Update case sensitive flag
                    $(this).data('filter').caseSensitive = val;
                    //Trigger custom event to indicate .data('filter') change
                    $(this).trigger('filterUpdate');
                }
            })
        ;

        //Method to generate the PCRE/PHP regex str
        e.getRegex = function() {
            return '/' + e.find('.regexField').val() + '/'
                + (e.getOption('CaseSensitive')?'':'i')
            ;
        };

        return e;
    }
};
