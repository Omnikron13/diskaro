//require_once(CrockfordSugar.js)

//'Class' defining an output column for displaying tracks
function TrackColumn(heading, renderTD, sort) {
    this.heading = heading;
    this.renderTD = renderTD;
    this.sort = sort || TrackColumn.sortNull;
};

//Default sort order for null/non-null sorting
//where -1 puts nulls first & 1 puts them last
TrackColumn.nullSort = 1;

//Default str for null/unknown release output
TrackColumn.nullReleaseStr = _('Unknown');

//Method to render the columns <th> heading
TrackColumn.method('renderTH', function() {
    return $('<th>')
        //Output localised heading
        .html(_(this.heading))
    ;
});

//Static method to render a simple <td> with given innerHTML
TrackColumn.renderTD = function(innerHTML) {
    return $('<td>')
        .addClass('cell')
        .html(innerHTML)
    ;
};

//--Pre-defined renderTD functions--
TrackColumn.renderNumber = function(track) {
    //Render track number/position or null/unknown
    return TrackColumn.renderTD(
        track.trackNumber===null?
            '':
            track.trackNumber
    );
};

TrackColumn.renderTitle = function(track) {
    return TrackColumn.renderTD(track.name);
};

TrackColumn.renderRelease = function(track) {
    //Render release name or null/unknown
    return track.release===null?
        TrackColumn.renderTD(TrackColumn.nullReleaseStr)
            .addClass('null')
        :TrackColumn.renderTD(track.release.name)
    ;
};

TrackColumn.renderGenres = function(track) {
    return TrackColumn.renderTD(track.genres.renderUL());
};

TrackColumn.renderTags = function(track) {
    return TrackColumn.renderTD(track.tags.renderUL());
};

TrackColumn.renderRole = function(role) {
    return function(track) {
        return TrackColumn.renderTD(
            track.getArtistsByRole(role)
                .renderUL()
        );
    }
};

//--Pre-defined sort functions--
TrackColumn.sortNumber = function(a, b) {
    return a.trackNumber - b.trackNumber;
    return a.name.localeCompare(b.name);
};

TrackColumn.sortTitle = function(a, b) {
    return a.name.localeCompare(b.name);
};

TrackColumn.sortRelease = function(a, b) {
    //Sort nulls
    if(a.release === null) return b.release===null?0:TrackColumn.nullSort;
    if(b.release === null) return TrackColumn.nullSort - TrackColumn.nullSort * 2;
    //Sort non-nulls
    return a.release.name.localeCompare(b.release.name);
};

TrackColumn.sortGenres = function(a, b) {
    return a.genres
        .toString()
        .localeCompare(
            b.genres.toString()
        )
    ;
};

TrackColumn.sortTags = function(a, b) {
    return a.tags
        .toString()
        .localeCompare(
            b.tags.toString()
        )
    ;
};

TrackColumn.sortRole = function(role) {
    return function(a, b) {
        return a.getArtistsByRole(role).toString()
            .localeCompare(b.getArtistsByRole(role).toString());
    };
};

//Default sort method - sorts nothing
TrackColumn.sortNull = function() {
    return 0;
};
