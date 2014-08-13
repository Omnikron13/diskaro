//require_once(Track.UI.js)

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
            //Initialise output
            .trigger('updateTrack', track)
        ;
    },
};
