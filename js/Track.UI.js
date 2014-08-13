//require_once(Track.js)

//UI 'namespace' for jQuery UI functionality
Track.UI = {
    //Subnamespace for context menu widget (jQuery UI plugin)
    Context: {
        //Array of items in the menu
        items: [
            //Edit: open dialogue box where the user can edit Track data
            {title: _('Edit'), action: function(ev, ui) {
                Track.UI.Edit.renderDialogue(ui.target.parents('.trackItem').data('track'));
            }}
        ],

        //Function to initialise the menu on given selector (or body)
        init: function(selector) {
            $(selector || 'body')
                .contextmenu({
                    delegate: '.trackItem',
                    menu: Track.UI.Context.items,
                })
            ;
        },
    },

    //Subnamespace for UI functionality for editing Track data
    Edit: {
        //Function to render a Dialog widget with controls for editing Track data
        renderDialogue: function(t) {
            return $('<div>')
                //Add selection class
                .addClass('editTrack')
                //Set dialogue title (render in top bar)
                .attr('title', _('Edit Track'))
                //Render Title/Name section
                .append(
                    $('<label>')
                        .attr('for', 'trackNameField')
                        .html(_('Title'))
                )
                //Render actual input box
                .append(
                    $('<input>')
                        .attr('id', 'trackNameField')
                        .val(t.name)
                )
                //Render Artists section
                //Render Genres section
                .append(
                    Track.UI.Edit.renderDataList(t.genres, _('Genres'))
                )
                //Render Tags section
                .append(
                    Track.UI.Edit.renderDataList(t.tags, _('Tags'))
                )
                //Create & show dialogue box
                .dialog({
                    modal: true,
                    resizable: false,
                    draggable: false,
                    closeOnEscape: true,
                    buttons: [
                        {text: _('Cancel'), click: function() {
                            $(this).dialog('destroy');
                        }},
                        {text: _('Save')},
                    ],
                })
            ;
        },

        //Function for rendering DataList output/edit sections
        renderDataList: function(dl, head) {
            return $('<fieldset>')
                .addClass('editList')
                //Render section header/legend
                .append(
                    $('<legend>')
                        .addClass('header')
                        .html(head)
                )
                //Render DataList as a list
                .append(
                    dl.renderUL()
                )
                //Render an 'Add' button
                .append(
                    $('<button>')
                        .addClass('add')
                        .attr('type', 'button')
                        .html(_('Add'))
                        .on('click', function() {
                            //Check load full list
                            $.when(DataList.All.loaded(dl.type))
                                .done(function() {
                                    //Create/Display selection dialogue
                                    DataList.UI.Dialogue.render(DataList.All[dl.type], 'add')
                                        .on('save', function(ev, d) {
                                            //--Actual add logic here--
                                        })
                                    ;
                                });
                        })
                )
            ;
        },
    },
};
