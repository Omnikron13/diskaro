//Object for accessing the <audio> player
var Player = $('<audio>')
    .attr('id', 'audioPlayer')
    .attr('controls', 'true')
    .append(
        $('<source>')
            .attr('id', 'audioPlayerSource')
            .attr('src', '_.ogg')
            .attr('type', 'audio/ogg')
    )
    //Event to load & play a Track obj immediately
    .on('playTrack', function(ev, t) {
        $(this)
            //Store Track obj
            .data('track', t)
            //Update source tag
            .children('source')
                .attr('src', t.path)
                .end()
            //Load file & start playback
            .trigger('load')
            .trigger('play')
        ;
    })
    //Catch ended/track finished events
    .on('ended', function() {
        //Trigger custom event to start next Track playing - behaviour
        //defined externally by e.g. TrackList.UI.Table
        $(this).trigger('playNext');
    })
;

//Method to insert the Player object into the DOM
Player.init = function(selector) {
    $(selector || '#audioPlayer').replaceWith(this);
    return this;
};

//Method to load & start playing a Track
Player.play = function(track) {
    this.children('source')
        .attr('src', track.path);
    this
        .trigger('load')
        .trigger('play')
    ;
    return this;
};
