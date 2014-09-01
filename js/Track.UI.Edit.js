//require_once(Track.UI.js)

//Namespace for UI functionality for editing Track data
Track.UI.Edit = {
    //Function to render a Dialog widget with controls for editing Track data
    renderDialogue: function(t) {
        return $('<div>')
            //Add selection class
            .addClass('editTrack')
            //Set dialogue title (render in top bar)
            .attr('title', _('Edit Track'))
            //Render sections from .Section.All array
            .append(
                Track.UI.Edit.Section.All.map(function(s) {
                    return s(_t);
                })
            )
            //Catch save event & update Track obj
            .on('save', function(ev, t) {
                //Trigger save event on all sections to process changes
                $(this).find('.section').each(function() {
                    $(this).triggerHandler('save');
                });
            })
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
                            .triggerHandler('saveAndClose', t)
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
        Title: function(t) {
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
                        .val(t.name)
                )
                //Catch save event & update Track obj .name
                .on('save', function() {
                    t.name = $(this).find('#trackNameField').val();
                })
            ;
        },

        //Subnamespace for rendering Release/# sections
        Release: {
            render: function(t) {
                return Track.UI.Edit.Section.render('release', _('Release'))
                    //Render Release object/placeholder
                    .append(
                        Track.UI.Edit.Section.Release.renderData(t.release)
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
                                    .val(t.trackNumber)
                            )
                    )
                    //Catch save event & update Track obj release & number
                    .on('save', function() {
                        //Update Track release id/obj
                        var r = $(this).find('.data.Release').data('data');
                        t.setRelease(r);
                        //Update Track number
                        var s = $(this).find('#trackNumberField').val();
                        t.setTrackNumber(s);
                    })
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
            render: function(t) {
                return Track.UI.Edit.Section.render('artists', _('Artists'))
                    //Render Role/Artists table
                    .append(
                        $('<table>')
                            .append(
                                //Render a row for each unique Role
                                t.getRoles().map(function(r) {
                                    return Track.UI.Edit.Section.Artists.renderRow(t, r);
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
                                                Track.UI.Edit.Section.Artists.renderRow(t, d)
                                            )
                                        ;
                                    });
                                });
                            })
                    )
                    //Catch save event & update Track obj ArtistLinks
                    .on('save', function() {
                        //Init array to hold new ArtistLink objs
                        var links = [];
                        //Iterate table (Role) rows
                        $(this).find('.row').each(function() {
                            //Get Role obj for new ArtistLink objs
                            var r = $(this).find('.data.Role').data('data');
                            //Iterate Artist Data.UI elements
                            $(this).find('.data.Artist').each(function() {
                                //Add new ArtistLink obj to array
                                links.push(new ArtistLink({
                                    role   : r,
                                    artist : $(this).data('data'),
                                }));
                            });
                        });
                        //Replace Track obj's ArtistLink array
                        t.setArtistLinks(links);
                    })
                ;
            },

            //Function to render a table row from Track & Role obj
            renderRow: function(t, r) {
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
                                DataList.UI.UL.render(t.getArtistsByRole(r))
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
        Genres: function(t) {
            return Track.UI.Edit.Section.renderDataList(t.getGenres(), _('Genres'))
                //Catch save event & update Track obj Genre id/obj list
                .on('save', function() {
                    var dl = $(this).find('.dataList').data('datalist');
                    t.setGenres(dl);
                })
            ;
        },

        //Subnamespace for rendering Tags sections
        Tags: function(t) {
            return Track.UI.Edit.Section.renderDataList(t.getTags(), _('Tags'))
                //Catch save event & update Track obj Tag id/obj list
                .on('save', function() {
                    var dl = $(this).find('.dataList').data('datalist');
                    t.setTags(dl);
                })
            ;
        },

        //Utility function for rendering DataList output/edit sections
        renderDataList: function(dl, head) {
            var dl = dl.clone();
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

//Array holding render functions for default 'all' sections
Track.UI.Edit.Section.All = [
    Track.UI.Edit.Section.Title,
    Track.UI.Edit.Section.Release.render,
    Track.UI.Edit.Section.Artists.render,
    Track.UI.Edit.Section.Genres,
    Track.UI.Edit.Section.Tags,
];
