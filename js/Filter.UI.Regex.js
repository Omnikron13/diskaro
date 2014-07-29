//require_once(Filter.UI.js)

//Namespace for regex filter UI elements
Filter.UI.Regex = {
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
                    .append(
                        $('<legend>')
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
                            .attr('type', 'text')
                            .attr('placeholder', 'Enter regex...')
                            //Pass on /actual/ changes to the regex as a change event
                            .on('input', function() {
                                e.trigger('change');
                            })
                    )
            )
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
