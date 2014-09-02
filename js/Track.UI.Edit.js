//require_once(UI.js)
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
                    return s(t);
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
            return UI.Edit.Section.Input('title', _('Title'), t.name)
                //Catch save event & update Track obj .name
                .on('save', function() {
                    t.name = $(this).find('input').val();
                })
            ;
        },

        //Function for rendering Release sections
        Release: function(t) {
            return UI.Edit.Section.Data('Release', t.getRelease())
                .on('save', function() {
                    var r = $(this).find('.data.Release').triggerHandler('getData');
                    t.setRelease(r);
                })
            ;
        },

        //Function for rendering .trackNumber sections
        Number: function(t) {
            return UI.Edit.Section.Input(
                'number',
                _('Track Number'),
                t.trackNumber,
                {
                    placeholder: _('#'),
                    type: 'number',
                }
            )
                .on('save', function() {
                    var s = $(this).find('input').val();
                    t.setTrackNumber(s);
                })
            ;
        },

        //Subnamespace for rendering Artists sections
        Artists: {
            //Function to render main section element
            render: function(t) {
                return UI.Edit.Section.render('artists', _('Artists'))
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
                                    roleID   : r.id,
                                    artistID : $(this).data('data').id,
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
                                    //Open selection dialogue on Data.UI click
                                    .on('click', '.data', function() {
                                        $(this).trigger('updateDialogue');
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

        //Function for rendering Genres sections
        Genres: function(t) {
            return UI.Edit.Section.DataList('genres', _('Genres'), t.getGenres())
                //Catch save event & update Track obj Genre id/obj list
                .on('save', function() {
                    var dl = $(this).find('.dataList').data('datalist');
                    t.setGenres(dl);
                })
            ;
        },

        //Function for rendering Tags sections
        Tags: function(t) {
            return UI.Edit.Section.DataList('tags', _('Tags'), t.getTags())
                //Catch save event & update Track obj Tag id/obj list
                .on('save', function() {
                    var dl = $(this).find('.dataList').data('datalist');
                    t.setTags(dl);
                })
            ;
        },
    },
};

//Array holding render functions for default 'all' sections
Track.UI.Edit.Section.All = [
    Track.UI.Edit.Section.Title,
    Track.UI.Edit.Section.Release,
    Track.UI.Edit.Section.Number,
    Track.UI.Edit.Section.Artists.render,
    Track.UI.Edit.Section.Genres,
    Track.UI.Edit.Section.Tags,
];
