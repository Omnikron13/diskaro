//require_once(Filter.UI.js)

//Subnamespace for Compound Filter UI elements
Filter.UI.Compound = {
    //Default/valid operators for options section
    operators: [
        {label: _('Or'),  value: 'OR'},
        {label: _('And'), value: 'AND'},
        {label: _('Xor'), value: 'XOR'},
    ],

    //Default UI strings
    operatorStr   : _('Operator'),
    newFilterStr  : _('New Filter'),
    emptyFilterStr: _('Empty Filter'),
    placeholderStr: _('Loading') + '...',
    removeStr     : _('Remove'),

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
                Filter.UI.Compound.operators,
                Filter.UI.Compound.operatorStr
            ),
            prefix
        )
            //Init constituent Filter storage
            .data('filters', [])
            //Add accordion container
            .append(
                $('<div>') //Shouldn't be hard coded
                    //Add class for generic selection (e.g. .filter>.body)
                    .addClass('body')
                    //Add class for specific selection (e.g. .compoundFilter>.body.atoms)
                    .addClass('atoms')
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
                            //Switch the header from new to empty
                            u.newHeader
                                //Prevent retriggering
                                .data('new', false)
                                //Find actual header text & update it
                                .find('.text')
                                    .html(Filter.UI.Compound.emptyFilterStr)
                                    .end()
                                //Add remove button
                                .append(
                                    Filter.UI.Compound.Atom.renderRemove(e, u)
                                )
                            ;
                            //Replace placeholder with Filter.UI.Tabs
                            u.newPanel
                                .replaceWith(
                                    Filter.UI.Compound.Atom.renderBody(
                                        e,
                                        prefix,
                                        index++,
                                        atoms
                                    )
                                )
                            ;
                            //Update accordion
                            e.children('.body.atoms')
                                //Fix stuck panels
                                .accordion('option', 'active', false)
                                .accordion('option', 'active', -1)
                                .end()
                                //Add next 'New Filter' placeholder
                                .addAtom()
                            ;
                        }
                    })
            )
            //Store human-readable string on changes
            .on('change', function() {
                var s = e.getOption('Operator');
                if(e.getOption('Negate')) s = '!' + s;
                e.data('filterStr', s);
            })
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

        //Method to add Filter.UI.Tabs placeholder rows
        e.addAtom = function() {
            return e.children('.body.atoms')
                //Add new placeholder to the end
                .append(
                    Filter.UI.Compound.Atom.renderPlaceholder()
                )
                //Update the accordion
                .accordion('refresh')
                .end()
            ;
        };

        //And add an initial row...
        e.addAtom();

        //Done rendering; return
        return e;
    },

    //Subnamespace for atom/row functionality
    Atom: {
        //Function to render Atom/Accordion header
        renderHeader: function() {
            return $('<h2>')
                //Add class for generic selection (e.g. .compoundFilter>.body.atoms>.atomHeader)
                .addClass('atomHeader')
                .append(
                    $('<span>')
                        //Add class to allow easy selection
                        .addClass('text')
                        .html(Filter.UI.Compound.newFilterStr)
                )
                .data('new', true)
            ;
        },

        //Function to render a placeholder atom/row so actual Filter.UI.Tabs
        //elements can be created Just In Time (which /should/ prevent
        //infinite recursion...)
        renderPlaceholder: function() {
            return [
                Filter.UI.Compound.Atom.renderHeader(),
                $('<p>')
                    .addClass('placeholder')
                    .html(Filter.UI.Compound.placeholderStr)
            ];
        },

        //Render actual Filter.UI.Tabs element (to replace placeholder)
        renderBody: function(cf, prefix, index, filters) {
            return Filter.UI.Tabs.render(
                $.map(filters, function(f, i) {
                    return f.render.apply(
                        null,
                        f.args.concat(prefix + 'Atom-' + index + '-Filter-' + i)
                    );
                }),
                prefix + 'Atom-' + index
            )
                //Add class for generic selection (e.g. .compoundFilter>.body.atoms>.atom)
                .addClass('atom')
                //Disable collapsing - would null the filter
                .tabs('option', 'collapsible', false)
                //Catch filter updates from the Filter.UI.Tabs
                .on('filterUpdate', function(ev, f) {
                    //Prevent (further) bubbling
                    ev.stopPropagation();
                    //Find header actual text wrapper
                    $(this).prev().find('.text')
                        //Update it
                        .html(
                            f == null?
                                Filter.UI.Compound.emptyFilterStr:
                                f.toString()
                        )
                    ;
                    //Store Filter obj in array (in case main Filter isn't/can't init)
                    cf.data('filters')[index] = f;
                })
            ;
        },

        //Render a remove button that can be used to remove an atom/row
        renderRemove: function(f, u) {
            return $('<button>')
                //Add class to allow easy selection
                .addClass('remove')
                .attr('type', 'button')
                .html(Filter.UI.Compound.removeStr)
                //Process remove
                .on('click', function(ev) {
                    //Prevent click bubbling to accordion header
                    ev.stopPropagation();
                    //Remove header & content
                    u.newHeader
                        .next()
                            .remove()
                            .end()
                        .remove()
                    ;
                    //Trigger change/filter updates
                    f.trigger('change');
                })
            ;
        },
    },
};
