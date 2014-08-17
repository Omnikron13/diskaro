//require_once(TrackList.js)

//UI 'namespace' for UI functionality
TrackList.UI = {
    //Subnamespace for <table> output
    Table: {
        //Function to render <table> from a TrackList
        render: function(tl, columns) {
            return $('<table>')
                //Initialise internal TrackList object
                .data('tracklist', new TrackList([]))
                //Add selection class
                .addClass('trackList')
                //Render headings row
                .append(TrackList.UI.Table.renderHeadings(columns))
                //Render Track rows
                .append(
                    tl.list.map(function(t, i) {
                        return Track.UI.Row.render(t, columns)
                            //Custom event to start Track playing
                            .on('play', function() {
                                tl.play(i);
                            })
                            //Retrigger double clicks as play events
                            .on('dblclick', function() {
                                $(this).triggerHandler('play')
                            })
                        ;
                    })
                )
                //Event to sort Track.UI.Row elements with Track sort callback
                .on('sort', function(ev, s) {
                    //If no previous sort heading stored
                    if(!$(this).data('sort'))
                        //Store triggering (jQuery) element
                        $(this).data('sort', $(ev.target));
                    //If a sort heading is stored
                    else {
                        //Check if it is the same heading as triggering this sort
                        if($(this).data('sort').get(0) != ev.target) {
                            //It isn't; clear the old heading sort class
                            $(this).data('sort').trigger('sortNone')
                            //...and store the new heading
                            $(this).data('sort', $(ev.target));
                        }
                    }
                    //Sort the Track.UI.Row elements
                    $(this)
                        .find('.trackItem')
                            //Temporarily remove them from the DOM
                            .detach()
                            //Perform actual sorting
                            .sort(function(a, b) {
                                return s($(a).data('track'), $(b).data('track'));
                            })
                            //Re-attach them
                            .appendTo($(this))
                            .end()
                    ;
                })
                //Event to load & output new TrackList from given Filter
                .on('load', function(ev, f) {
                    //Store 'this' for callbacks
                    var that = $(this);
                    //Load Tracks from DB & defer output
                    $.when(that.data('tracklist').load(f))
                        .done(function() {
                            that
                                //Clear old Track.UI.Row elements
                                .find('.trackItem')
                                    .remove()
                                    .end()
                                //Render new Track.UI.Row elements
                                .append(
                                    that.data('tracklist').list.map(function(t, i) {
                                        return Track.UI.Row.render(t, columns)
                                            //Custom event to start Track playing
                                            .on('play', function() {
                                                that.data('tracklist').play(i);
                                            })
                                            //Retrigger double clicks as play events
                                            .on('dblclick', function() {
                                                $(this).triggerHandler('play')
                                            })
                                        ;
                                    })
                                )
                            ;
                        })
                })
            ;
        },

        //Function to render table headings row
        renderHeadings: function(columns) {
            return $('<tr>')
                //Add selection class
                .addClass('headings')
                //Render actual heading cells
                .append(
                    columns.map(function(c, i) {
                        return c.renderTH()
                            //Event to trigger asc. sort on this column
                            .on('sortAsc', function() {
                                $(this)
                                    .addClass('sortAsc')
                                    .removeClass('sortDesc')
                                    .trigger('sort', c.sort)
                                ;
                            })
                            //Event to trigger desc. sort on this column
                            .on('sortDesc', function() {
                                $(this)
                                    .addClass('sortDesc')
                                    .removeClass('sortAsc')
                                    .trigger('sort', function(a, b) {
                                        return c.sort(a, b) * -1;
                                    })
                                ;
                            })
                            //Event to clear sort on this column
                            .on('sortNone', function() {
                                $(this)
                                    .removeClass('sortAsc')
                                    .removeClass('sortDesc')
                                ;
                            })
                            //Handle heading clicks
                            .on('click', function() {
                                //If already sorting asc. then sort desc.
                                if($(this).hasClass('sortAsc')) {
                                    $(this).trigger('sortDesc');
                                    return;
                                }
                                //Otherwise sort asc.
                                $(this).trigger('sortAsc');
                            })
                        ;
                    })
                )
            ;
        },
    },
};
