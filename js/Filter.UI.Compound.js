//require_once(Filter.UI.js)

//Subnamespace for Compound Filter UI elements
Filter.UI.Compound = {
    //Default/valid operators for options section
    operators: [
        {label: 'Or',  value: 'OR'},
        {label: 'And', value: 'AND'},
        {label: 'Xor', value: 'XOR'},
    ],

    //Function for creating new/empty Compound Filter UI elements
    render: function(atoms, prefix) {
        //Index to disambiguate constituent Filter.UI ids
        var index = 0;

        //Create element from base template
        var e = Filter.UI.core.render(
            'Compound',
            Filter.UI.core.optionRadio(
                prefix,
                'Operator',
                Filter.UI.Compound.operators
            ),
            prefix
        )
            //Add accordion container
            .append(
                $('<div>') //Shouldn't be hard coded
                    .addClass('compoundFilterAtoms')
                    //Setup widget
                    .accordion({
                        collapsible: true,
                        active: false,
                        heightStyle: 'content',
                    })
                    //Add new atom when the last one is opened
                    .on('accordionactivate', function(ev, u) {
                        //Do nothing if it was a tab closed
                        if(Object.keys(u.newHeader).length == 0) return;
                        if(u.newHeader.data('new')) {
                            u.newHeader
                                .data('new', false)
                                .find('.compoundFilterAtomHeader')
                                    .html('Empty Filter')
                            ;
                            e.addAtom();
                        }
                    })
            )
        ;

        //Add method to create Filter obj from UI state
        e.getFilter = function() {
            var op = e.getOption('Operator');
            //Filter isn't valid without an operator
            if(typeof op == 'undefined')
                return null;
            //Construct actual Filter object
            return Filter.Compound(
                //jQuery likes to return 'array-like' objects; convert...
                $.makeArray(
                    //Find the Filter.UI.Tabs
                    e.children('.ui-accordion')
                        .children('.filterTabs')
                            //Extract their stored filters
                            .map(function(i, ft) {
                                return $(this).data('filter');
                            })
                ),
                op,
                e.getOption('Negate')
            );
        };

        //Method to add Filter.UI.Tabs rows
        e.addAtom = function() {
            return e.children('.compoundFilterAtoms')
                .append(
                    Filter.UI.Compound.renderAtom(
                        prefix,
                        index++,
                        atoms
                    )
                )
                .accordion('refresh')
                .end()
            ;
        };

        //And add an initial row...
        e.addAtom();

        //Done rendering; return
        return e;
    },

    //Create new Filter.UI.Tabs from filters array of constructor/args
    renderAtom: function(prefix, index, filters) {
        return [
            //Render header
            $('<h2>')
                .append(
                    $('<span>')
                        .addClass('compoundFilterAtomHeader')
                        .html('New Filter')
                )
                .data('new', true)
            ,
            //Render tabs
            Filter.UI.Tabs.render(
                $.map(filters, function(f, i) {
                    return f.render.apply(
                        null,
                        f.args.concat(prefix + 'Atom-' + index + '-Filter-' + i)
                    );
                }),
                prefix + 'Atom-' + index
            )
                .addClass('compoundFilterAtom')
                //Disable collapsing - would null the filter
                .tabs('option', 'collapsible', false)
                .on('change', function() {
                    $(this).prev()
                        .find('.compoundFilterAtomHeader')
                            .html(
                                $(this).data('filter') === null?
                                    'Empty Filter':
                                    $(this).data('filterType') + ': ' + $(this).data('filterStr')
                            )
                    ;
                })
        ];
    },
};
