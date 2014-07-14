//Object for accessing the <audio> player
var Player = $('<audio>')
    .attr('id', 'audioPlayer')
    .attr('controls', 'true')
    .append($('<source>')
        .attr('id', 'audioPlayerSource')
        .attr('src', '_.ogg')
        .attr('type', 'audio/ogg')
    )
;

//Method to insert the Player object into the DOM
Player.init = function(selector) {
    $(selector || '#audioPlayer').replaceWith(this);
    return this;
};

//Method to attach Player events to the relevant TrackList callbacks
Player.link = function(tracklist) {
    this
        .off('ended')
        .on('ended', function() {
            tracklist.playNext();
        })
    ;
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
