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
                Track.UI.Edit.Section.Title(_t)
            )
            //Render Release/# section
            .append(
                Track.UI.Edit.Section.Release.render(_t)
            )
            //Render Artists section
            .append(
                Track.UI.Edit.Section.Artists.render(_t)
            )
            //Render Genres section
            .append(
                Track.UI.Edit.Section.Genres(_t)
            )
            //Render Tags section
            .append(
                Track.UI.Edit.Section.Tags(_t)
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
                width: 800,
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
            //Add context menu (jQuery UI plugin) to Data.UI elements
            .contextmenu({
                delegate: '.data',
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

        //Function for rendering Title sections
        Title: function(_t) {
            return Track.UI.Edit.Section.render('title', _('Title'))
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
            ;
        },

        //Subnamespace for rendering Release/# sections
        Release: {
            render: function(_t) {
                return Track.UI.Edit.Section.render('release', _('Release'))
                    //Render Release object/placeholder
                    .append(
                        Track.UI.Edit.Section.Release.renderData(_t.release)
                            .on('dataUpdate', function(ev, d) {
                                _t.release = d.new;
                            })
                    )
                    //Render trackNumber field (container)
                    .append(
                        $('<span>')
                            //Add sub-section selection class
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
                ;
            },

            //Function to render Release obj or null/placeholder
            renderData: function(r) {
                return $('<span>')
                    //Add sub-section selection class
                    .addClass('release')
                    //Render Data.UI/placeholder
                    .append(
                        //Check if Release is null
                        r ?
                            //Not null; render Data.UI
                            Data.UI.Span(r)
                        : //Is null; render placeholder
                        $('<p>')
                            .addClass('null')
                            .html(_('Unknown'))
                    )
                    .on('click', '.null', function() {
                        //Save this for closure
                        var that = $(this);
                        //Create/display Release selection dialogue
                        DataList.UI.Dialogue.Release('select', function(dl) {
                            dl
                                //Replace placeholder with Data.UI on save
                                .on('save', function(ev, d) {
                                    that
                                        .trigger('dataUpdate', {old:null, new:d})
                                        .replaceWith(Data.UI.Span(d))
                                    ;
                                })
                            ;
                        });
                    })
                    //Catch remove event on the Release Data.UI
                    .on('removeData', '.data', function() {
                        $(this)
                            //Trigger a dataUpdate to null the Track Release obj
                            .trigger('dataUpdate', {
                                old: $(this).data('data'),
                                new: null
                            })
                            //Replace the Data.UI with null/placeholder
                            .replaceWith(
                                $('<p>')
                                    .addClass('null')
                                    .html(_('Unknown'))
                            )
                        ;
                    })
                ;
            },
        },

        //Subnamespace for rendering Artists sections
        Artists: {
            //Function to render main section element
            render: function(_t) {
                return Track.UI.Edit.Section.render('artists', _('Artists'))
                    //Render Role/Artists table
                    .append(
                        $('<table>')
                            .append(
                                //Render a row for each unique Role
                                _t.getRoles().map(function(r) {
                                    return Track.UI.Edit.Section.Artists.renderRow(_t, r);
                                })
                            )
                    )
                    //Render button for adding new Role rows
                    .append(
                        $('<button>')
                            .addClass('add')
                            .attr('type', 'button')
                            .html(_('Add Role'))
                            .on('click', function() {
                                var that = $(this);
                                DataList.UI.Dialogue.Role('add', function(dl) {
                                    dl.on('save', function(ev, d) {
                                        that.prev('table')
                                            .append(
                                                Track.UI.Edit.Section.Artists.renderRow(_t, d)
                                            )
                                        ;
                                    });
                                });
                            })
                    )
                    //Catch changes to Artist objects
                    .on('dataUpdate', '.cell.artists', function(ev, d) {
                        //Extract corresponding Role object
                        var r = $(ev.target).parents('.row').data('role');
                        //Update ArtistLink obj
                        _t.setArtistLink(
                            {artist: d.old, role: r},
                            {artist: d.new, role: r}
                        );
                    })
                    //Catch changes to Role objects
                    .on('dataUpdate', '.cell.role', function(ev, d) {
                        //Select main row element
                        $(ev.target).parents('.row')
                            //Update stored Role obj
                            .data('role', d.new)
                            //Select & iterate Artist Data.UI elements
                            .find('.data.Artist')
                                .each(function(i, a) {
                                    //Update Track ArtistLink objects
                                    _t.setArtistLink(
                                        {artist: $(a).data('data'), role: d.old},
                                        {artist: $(a).data('data'), role: d.new}
                                    );
                                })
                        ;
                    })
                    //Catch Data objects added to the Artist DataLists
                    .on('add', '.dataList', function(ev, d) {
                        //Add new ArtistLink to Track obj
                        _t.artistLinks.push(new ArtistLink({
                            artist : d,
                            role   : $(this).parents('.row').data('role'),
                        }));
                    })
                    //Catch artistRemove events from table rows
                    .on('artistRemove', '.row', function(ev, d) {
                        //Remove the relevant ArtistLink from Track obj
                        _t.removeArtistLink({artist: d, role: $(this).data('role')});
                    })
                ;
            },

            //Function to render a table row from Track & Role obj
            renderRow: function(_t, r) {
                return $('<tr>')
                    //Store Role obj
                    .data('role', r)
                    //Add selection class
                    .addClass('row')
                    //Render Role cell
                    .append(
                        $('<td>')
                            .addClass('cell')
                            .addClass('role')
                            .append(
                                Data.UI.Span(r)
                            )
                    )
                    //Render Artist(s) cell
                    .append(
                        $('<td>')
                            .addClass('cell')
                            .addClass('artists')
                            .append(
                                DataList.UI.UL.render(_t.getArtistsByRole(r))
                                    //Render 'Add' button
                                    .add(DataList.UI.UL.AddButton())
                            )
                    )
                    //Catch removeData events from Artist/Role being removed
                    .on('removeData', function(ev, d) {
                        //Trigger appropriate event to alert the main element
                        if($(ev.target).hasClass('Artist'))
                            $(this).trigger('artistRemove', d);
                        if($(ev.target).hasClass('Role'))
                            $(this).trigger('roleRemove', d);
                    })
                ;
            },
        },

        //Subnamespace for rendering Genres sections
        Genres: function(_t) {
            return Track.UI.Edit.Section.renderDataList(_t.genres, _('Genres'))
        },

        //Subnamespace for rendering Tags sections
        Tags: function(_t) {
            return Track.UI.Edit.Section.renderDataList(_t.tags, _('Tags'))
        },

        //Utility function for rendering DataList output/edit sections
        renderDataList: function(dl, head) {
            var e = Track.UI.Edit.Section.render('editList', head)
                //Add specific selection class (e.g. .editList.Genre)
                .addClass(dl.type)
                //Render DataList as a list
                .append(
                    DataList.UI.UL.render(dl)
                        //Render an 'Add' button
                        .add(DataList.UI.UL.AddButton())
                )
            ;
            return e;
        },
    },
};
