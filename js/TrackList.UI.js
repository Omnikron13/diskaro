//require_once(TrackList.js)

//UI 'namespace' for UI functionality
TrackList.UI = {
    //Subnamespace for <table> output
    Table: {
        //Function to render <table> from a TrackList
        render: function(columns, filter) {
            return $('<table>')
                //Initialise internal TrackList object
                .data('tracklist', new TrackList([]))
                //Add selection class
                .addClass('trackList')
                //Render headings row
                .append(TrackList.UI.Table.renderHeadings(columns))
                //Event to sort Track.UI.Row elements with Track sort callback
                .on('sort', function(ev, s) {
                    //If no previous sort heading stored
                    if(!$(this).data('sortColumn'))
                        //Store triggering (jQuery) element
                        $(this).data('sortColumn', $(ev.target));
                    //If a sort heading is stored
                    else {
                        //Check if it is the same heading as triggering this sort
                        if($(this).data('sortColumn').get(0) != ev.target) {
                            //It isn't; clear the old heading sort class
                            $(this).data('sortColumn').trigger('sortNone')
                            //...and store the new heading
                            $(this).data('sortColumn', $(ev.target));
                        }
                    }
                    //Sort the Track.UI.Row elements
                    $(this)
                        //Store raw sort function
                        .data('sort', s)
                        //Select Track.UI.Row elements
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
                                //Clear saved active Track.UI.Row
                                .removeData('activeRow')
                                //Clear old Track.UI.Row elements
                                .find('.trackItem')
                                    .remove()
                                    .end()
                                //Render new Track.UI.Row elements
                                .append(
                                    that.data('tracklist').list.map(function(t, i) {
                                        return Track.UI.Row.render(t, columns);
                                    })
                                )
                            ;
                            //If a sort column is active retrigger the sort
                            if(that.data('sortColumn')) {
                                that.data('sortColumn').trigger('sort', that.data('sort'));
                            }
                            //If there is an active track attempt to re-flag it
                            if(Player.data('track'))
                                that.trigger('setActiveTrack', Player.data('track'));
                        })
                })
                //Catch bubbled play events from Track.UI.Row elements
                .on('play', function(ev) {
                    //Save 'this' ref for closure
                    var that = $(this);
                    Player
                        //Clear any existing playNext callback(s)
                        .off('playNext')
                        //Bind new playNext callback
                        .on('playNext', function() {
                            //Get next Track.UI.Row element
                            var next = $(ev.target).next('.trackItem');
                            //Trigger play on next (or first) Track.UI.Row
                            if(next.length > 0)
                                next.trigger('play');
                            else
                                that.trigger('playIndex', 0);
                        })
                    ;
                })
                //Event to trigger play on Track.UI.Row at (post-sort) index
                .on('playIndex', function(ev, i) {
                    $(this).find('.trackItem').eq(i).trigger('play');
                })
                //Event to flag Track.UI.Row as active based on arbitrary Track obj
                .on('setActiveTrack', function(ev, t) {
                    $(this)
                        .find('.trackItem')
                            .trigger('setActive', t)
                    ;
                })
                //Catch setActive events bubbling from Track.UI.Row
                .on('setActive', function(ev) {
                    //Store new active Track.UI.Row element
                    $(this).data('activeRow', $(ev.target));
                })
                //Trigger inital load/output
                .trigger('load', filter)
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
