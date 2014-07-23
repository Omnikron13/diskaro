//require_once(CrockfordSugar.js)

//'Class' defining an output column for displaying tracks
function TrackColumn(heading, renderTD, sort) {
    this.heading = heading;
    this.renderTD = renderTD;
    this.sort = sort || TrackColumn.sortNull;
};

//Method to render the columns <th> heading
TrackColumn.method('renderTH', function() {
    return $('<th>')
        .html(this.heading)
    ;
});

//Static method to render a simple <td> with given innerHTML
TrackColumn.renderTD = function(innerHTML) {
    return $('<td>')
        .html(innerHTML)
    ;
};

//--Pre-defined renderTD functions--
TrackColumn.renderNumber = function(track) {
    return TrackColumn.renderTD(track.trackNumber);
};

TrackColumn.renderTitle = function(track) {
    return TrackColumn.renderTD(track.name);
};

TrackColumn.renderRelease = function(track) {
    return TrackColumn.renderTD(track.release.name);
};

TrackColumn.renderGenres = function(track) {
    return TrackColumn.renderTD(track.genres.map(function(g) {
        return g.name;
    }).join(', '));
};

TrackColumn.renderTags = function(track) {
    return $('<td>')
        .append(
            track.tags.renderUL()
        )
    ;
};

TrackColumn.renderRole = function(role) {
    return function(track) {
        return TrackColumn.renderTD(track.getArtistsByRole(role).map(function(a) {
            return a.name;
        }).join(', '));
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
    return a.release.name.localeCompare(b.release.name);
};

TrackColumn.sortGenres = function(a, b) {
    return a.genres.map(function(g) {
        return g.name;
    }).join(', ').localeCompare(b.genres.map(function(g) {
        return g.name;
    }).join(', '));
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
        return a.getArtistsByRole('Artist').map(function(artist) {
            return artist.name;
        }).join(', ').localeCompare(b.getArtistsByRole('Artist').map(function(artist) {
            return artist.name;
        }).join(', '));
    };
};

//Default sort method - sorts nothing
TrackColumn.sortNull = function() {
    return 0;
};
