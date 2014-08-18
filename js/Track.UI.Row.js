//require_once(Track.UI.js)
//require_once(Player.js)

//Namespace for table row (<tr>) output
Track.UI.Row = {
    //Function to create a new table row element
    render: function(track, columns) {
        return $('<tr>')
            //Add generic selection class
            .addClass('trackItem')
            //Custom event used to update/change the inernal Track obj
            .on('updateTrack', function(ev, t) {
                $(this)
                    .data('track', t)
                    .attr('title', t.getTitleString())
                    .html($.map(columns, function(c) {
                        return c.renderTD(t);
                    }))
            })
            //Event to flag this row as active (& unflag other rows)
            .on('setActive', function() {
                $(this)
                    //Add active/playing class
                    .addClass('active')
                    //Clear active class from any other active rows
                    .siblings('.trackItem.active')
                        .removeClass('active')
                ;
            })
            //Event to trigger immediate playback of this Track
            .on('play', function() {
                //Trigger setActive to update active flag
                $(this).triggerHandler('setActive');
                //Tell Player to start playing this Track now
                Player.trigger('playTrack', $(this).data('track'));
            })
            //Trigger playback on double-click
            .on('dblclick', function() {
                $(this).trigger('play');
            })
            //Initialise output
            .trigger('updateTrack', track)
        ;
    },
};
