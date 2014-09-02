//require_once(UI.js)
//require_once(Data.UI.js)
//require_once(DataList.UI.js)

//Namespace for creating/displaying edit dialogues for Data objects
Data.UI.Edit = {
    //Function to create & display an edit dialogue
    render: function(d, sections) {
        //Render dialogue container
        return $('<div>')
            //Add generic selection class
            .addClass('data')
            //Add semi-specific selection class (e.g. .data.edit)
            .addClass('edit')
            //Add specific selection class (e.g. .data.edit.Genre)
            .addClass(d.type)
            //Set dialogue title (render in top bar)
            .attr('title', _('Edit ' + d.type))
            //Render all sections (defined by .Section.All array)
            .append(
                Data.UI.Edit.Section.renderAll(d, sections)
            )
            //Catch save event & update Data obj
            .on('save', function(ev, d) {
                //Trigger save event on all sections to process changes
                $(this).find('.section').each(function() {
                    $(this).triggerHandler('save');
                });
            })
            //Shorthand event to trigger 'save' & destroy/close dialogue
            .on('saveAndClose', function() {
                $(this)
                    .trigger('save', d)
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
        Name: function(d) {
            return UI.Edit.Section.Input('name', _('Name'), d.name)
                .on('save', function() {
                    d.name = $(this).find('input').val();
                })
            ;
        },

        //Function for rendering Parents (.parentIDs) section
        Parents: function(d) {
            return UI.Edit.Section.DataList('parents', _('Parents'), d.getParents())
                .on('save', function() {
                    var dl = $(this).find('.dataList').data('datalist');
                    d.setParents(dl);
                })
            ;
        },

        //Function for rendering Children (.childIDs) section
        Children: function(d) {
            return UI.Edit.Section.DataList('children', _('Children'), d.getChildren())
                .on('save', function() {
                    var dl = $(this).find('.dataList').data('datalist');
                    d.setChildren(dl);
                })
            ;
        },

        //Utility function to render 'all' defined sections
        renderAll: function(d, all) {
            //Set default if no array given
            all = all || Data.UI.Edit.Section.All;
            //Render defined (optionally type-specific) sections
            return (all[d.type] || all).map(function(s) {
                return s(d);
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
