//require_once(Track.UI.js)

//Namespace for UI functionality for editing Track data
Track.UI.Edit = {
    //Function to render a Dialog widget with controls for editing Track data
    renderDialogue: function(t) {
        var _t = t.clone();
        return $('<div>')
            //Add selection class
            .addClass('editTrack')
            //Set dialogue title (render in top bar)
            .attr('title', _('Edit Track'))
            //Render Title/Name section
            .append(
                Track.UI.Edit.Section.render('title', _('Title'))
                    //Render input label
                    .append(
                        $('<label>')
                            .attr('for', 'trackNameField')
                            .html(_('Title'))
                    )
                    //Render actual input box
                    .append(
                        $('<input>')
                            .attr('id', 'trackNameField')
                            //Render empty/placeholder text
                            .attr('placeholder', _('Title') + '...')
                            .val(_t.name)
                            //Update .name of Track being edited on changes
                            .on('input', function() {
                                _t.name = $(this).val();
                            })
                    )
            )
            //Render Release/# section
            .append(
                Track.UI.Edit.Section.render('release', _('Release'))
                    //Render Release object
                    .append(
                        //Check if release is null
                        _t.release ?
                            //It isn't; render Data.UI element for it
                            Data.UI.Span(_t.release)
                                .on('dataUpdate', function(ev, d) {
                                    _t.release = d.new;
                                })
                            : //It is; render uknown/placeholder
                            $('<p>')
                                .addClass('null')
                                .html(_('Unknown'))
                    )
                    //Render trackNumber field (container)
                    .append(
                        $('<span>')
                            //Add selection class
                            .addClass('trackNumber')
                            //Render input label
                            .append(
                                $('<label>')
                                    .attr('for', 'trackNumberField')
                                    .html(_('Track Number'))
                            )
                            //Render actual input field
                            .append(
                                $('<input>')
                                    .attr('id', 'trackNumberField')
                                    .attr('type', 'number')
                                    //Render empty/placeholder text
                                    .attr('placeholder', _('#'))
                                    //Init value to current .trackNumber
                                    .val(_t.trackNumber)
                                    //Catch input changes/typing & update Track
                                    .on('input', function() {
                                        //Get new value (str)
                                        var s = $(this).val();
                                        //If blank set trackNumber to null/unknown
                                        if(s == '') {
                                            _t.trackNumber = null;
                                            return;
                                        }
                                        //Convert new value to int
                                        var i = parseInt(s, 10);
                                        //If conversion fails, abort
                                        if(Number.isNaN(i)) return;
                                        //Set new trackNumber
                                        _t.trackNumber = i;
                                    })
                            )
                    )
            )
            //Render Artists section
            //Render Genres section
            .append(
                Track.UI.Edit.renderDataList(_t.genres, _('Genres'))
            )
            //Render Tags section
            .append(
                Track.UI.Edit.renderDataList(_t.tags, _('Tags'))
            )
            //Internal event for shorthand save & close/destroy
            .on('saveAndClose', function(ev, t) {
                $(this)
                    .trigger('save', t)
                    .dialog('destroy')
                ;
            })
            //Delegated handler to open selection dialogue on Data.UI click
            .on('click', '.data', function(ev) {
                $(ev.target).trigger('updateDialogue');
            })
            //Create & show dialogue box
            .dialog({
                modal: true,
                resizable: false,
                width: 400,
                draggable: false,
                closeOnEscape: true,
                buttons: [
                    {text: _('Cancel'), click: function() {
                        $(this).dialog('destroy');
                    }},
                    {text: _('Save'), click: function() {
                        $(this)
                            .triggerHandler('saveAndClose', _t)
                        ;
                    }},
                ],
            })
        ;
    },

    //Subnamespace for section rendering
    Section: {
        //Utility function for rendering a generic/base section container
        render: function(name, head) {
            return $('<fieldset>')
                //Add generic selection class
                .addClass('section')
                //Add specific selection class
                .addClass(name)
                //Render header
                .append(
                    $('<legend>')
                        .addClass('header')
                        .html(head)
                )
            ;
        },
    },

    //Function for rendering DataList output/edit sections
    renderDataList: function(dl, head) {
        var e = Track.UI.Edit.Section.render('editList', head)
            //Add specific selection class (e.g. .editList.Genre)
            .addClass(dl.type)
            //Render DataList as a list
            .append(
                DataList.UI.UL.render(dl)
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
                                    //Catch selected Data obj on save
                                    .on('save', function(ev, d) {
                                        //Add selected Data obj to main list
                                        e.trigger('add', d);
                                    })
                                ;
                            });
                    })
            )
            //Catch 'add' events on the main element
            .on('add', function(ev, d) {
                //...and defer them to the DataList.UI.UL element
                $(this).find('.dataList')
                    .triggerHandler('add', d);
            })
            //Added context menu (jQuery UI plugin) to the Data.UI.LI elements
            .contextmenu({
                delegate: '.dataItem',
                //Define menu items
                menu: [
                    //Edit: Open DataList selection dialogue change this Data item
                    {title: _('Edit'), action: function(ev, ui) {
                        $(ui.target)
                            .trigger('updateDialogue')
                        ;
                    }},
                    //Remove: Remove Data obj from DataList & remove Data.UI.LI element
                    {title: _('Remove'), action: function(ev, ui) {
                        $(ui.target)
                            .trigger('removeData', $(ui.target).data('data'))
                        ;
                    }},
                ],
            })
        ;
        return e;
    },
};
