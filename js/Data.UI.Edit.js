//require_once(Data.UI.js)
//require_once(DataList.UI.js)

//Namespace for creating/displaying edit dialogues for Data objects
Data.UI.Edit = {
    //Function to create & display an edit dialogue
    render: function(d) {
        //Create temporary copy of Data obj to allow abort
        var _d = d.clone();
        //Render dialogue container
        return $('<div>')
            //Add generic selection class
            .addClass('data')
            //Add semi-specific selection class (e.g. .data.edit)
            .addClass('edit')
            //Add specific selection class (e.g. .data.edit.Genre)
            .addClass(_d.type)
            //Set dialogue title (render in top bar)
            .attr('title', _('Edit ' + _d.type))
            //Render all sections (defined by .Section.All array)
            .append(
                Data.UI.Edit.Section.renderAll(_d)
            )
            //Catch save event & update Data obj
            .on('save', function(ev, _d) {
                //Trigger save event on all sections to process changes
                $(this).find('.section').each(function() {
                    $(this).triggerHandler('save');
                });
            })
            //Shorthand event to trigger 'save' & destroy/close dialogue
            .on('saveAndClose', function() {
                $(this)
                    .trigger('save', _d)
                    .dialog('destroy')
                ;
            })
            //Create & show Dialog widget
            .dialog({
                //Set initial dimensions (in horrible pixels...)
                width: 600,
                //General/misc. settings
                modal: true,
                closeOnEscape: true,
                //Define save/close buttons
                buttons: [
                    //Cancel: close dialogue immediately, abort changes
                    {text: _('Cancel'), click: function() {
                        $(this).dialog('destroy');
                    }},
                    //Save: output changes via save event & close dialogue
                    {text: _('Save'), click: function() {
                        $(this)
                            .trigger('saveAndClose')
                        ;
                    }},
                ],
            })
        ;
    },

    //Subnamespace for section rendering code
    Section: {
        //Utility function to render base section container element
        render: function(name, head) {
            return $('<fieldset>')
                //Add generic selection class
                .addClass('section')
                //Add specific selection class (e.g. .section.parents)
                .addClass(name)
                //Render header element
                .append(
                    $('<legend>')
                        .addClass('header')
                        .html(head)
                )
            ;
        },

        //Function for rendering Name (.name) section
        Name: function(_d) {
            return Data.UI.Edit.Section.render('name', _('Name'))
                .append(
                    $('<input>')
                        .val(_d.name)
                )
                .on('save', function() {
                    _d.name = $(this).find('input').val();
                })
            ;
        },

        //Function for rendering Parents (.parentIDs) section
        Parents: function(_d) {
            return Data.UI.Edit.Section.renderDataList(
                _d,
                'parents',
                _('Parents'),
                'parentIDs',
                'getParentList'
            );
        },

        //Function for rendering Children (.childIDs) section
        Children: function(_d) {
            return Data.UI.Edit.Section.renderDataList(
                _d,
                'children',
                _('Children'),
                'childIDs',
                'getChildList'
            );
        },

        //Utility function to render a DataList section from Data obj, section
        //name/header str, Data property to update & method to get the DataList
        renderDataList: function(_d, name, head, prop, get) {
            //Render section container element
            var e = Data.UI.Edit.Section.render(name, head)
                //Render placeholder for DataList
                .append(
                    $('<p>')
                        .addClass('placeholder')
                        .html(_(_d.type + ' list loading') + '...')
                )
                //Update Data obj on 'save' events
                .on('save', function() {
                    _d[prop] = $(this).data('datalist').getIDs();
                })
            ;
            //Defer DataList.UI rendering
            _d[get](function(dl) {
                e
                    //Store DataList obj on main .section element
                    .data('datalist', dl)
                    //Replace placeholder with DataList.UI (+add button)
                    .find('.placeholder')
                        .replaceWith(
                            DataList.UI.UL.render(dl)
                                .add(DataList.UI.UL.AddButton())
                        )
                ;
            });
            //Return element for output while the DataList loads
            return e;
        },

        //Utility function to render 'all' defined sections
        renderAll: function(_d) {
            return Data.UI.Edit.Section.All.map(function(s) {
                return s(_d);
            });
        },
    },
};

//Array defining what .Section.renderAll() should render
Data.UI.Edit.Section.All = [
    Data.UI.Edit.Section.Name,
    Data.UI.Edit.Section.Parents,
    Data.UI.Edit.Section.Children,
];
