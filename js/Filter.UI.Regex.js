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
            Filter.UI.core.optionCheckbox(prefix, 'CaseSensitive', 'Case Sensitive'),
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
                            .html('Regex')
                    )
                    .append(
                        $('<label>')
                            .attr('for', 'regexField')
                            .html('Regex')
                    )
                    .append(
                        $('<input>')
                            .addClass('regexField')
                            .attr('name', 'regexField')
                            .attr('type', Filter.UI.Regex.fieldType)
                            .attr('placeholder', 'Enter regex...')
                            //Pass on /actual/ changes to the regex as a change event
                            .on('input', function() {
                                e.trigger('change');
                            })
                    )
            )
            //Store human-readable filterStr on changes
            .on('change', function() {
                var s = e.getRegex();
                if(e.getOption('Negate')) s = '!' + s;
                e.data('filterStr', s);
            })
        ;

        //Method to generate the PCRE/PHP regex str
        e.getRegex = function() {
            return '/' + e.find('.regexField').val() + '/'
                + (e.getOption('CaseSensitive')?'':'i')
            ;
        };

        //Method to return a Filter object based on options/entered regex
        e.getFilter = function() {
            return Filter.Regex(
                e.getRegex(),
                e.getOption('Negate')
            );
        };

        return e;
    }
};
