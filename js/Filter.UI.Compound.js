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
                    //Add class for generic selection (e.g. .filter>.body)
                    .addClass('body')
                    //Add class for specific selection (e.g. .compoundFilter>.body.atoms)
                    .addClass('atoms')
                    //Add class for specific selection
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
                            //Switch the header from new to empty
                            u.newHeader
                                //Prevent retriggering
                                .data('new', false)
                                .find('.compoundFilterAtomHeader')
                                    .html('Empty Filter')
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
                                        prefix,
                                        index++,
                                        atoms
                                    )
                                )
                            ;
                            //Update accordion
                            e.children('.compoundFilterAtoms')
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
            return e.children('.compoundFilterAtoms')
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
                .append(
                    $('<span>')
                        .addClass('compoundFilterAtomHeader')
                        .html('New Filter')
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
                    .html('Loading...')
            ];
        },

        //Render actual Filter.UI.Tabs element (to replace placeholder)
        renderBody: function(prefix, index, filters) {
            return Filter.UI.Tabs.render(
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
            ;
        },

        //Render a remove button that can be used to remove an atom/row
        renderRemove: function(f, u) {
            return $('<button>')
                .addClass('compoundFilterAtomRemove')
                .attr('type', 'button')
                .html('Remove')
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
