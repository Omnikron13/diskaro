//require_once(CrockfordSugar.js)

//'Class' defining an output column for displaying tracks
function TrackColumn(heading, renderTD) {
    this.heading = heading;
    this.renderTD = renderTD;
};

//Method to render the columns <th> heading
TrackColumn.method('renderTH', function() {
    var th = document.createElement('th');
    th.innerHTML = this.heading;
    return th;
});

//Static method to render a simple <td> with given innerHTML
TrackColumn.renderTD = function(innerHTML) {
    var td = document.createElement('td');
    td.innerHTML = innerHTML;
    return td;
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

TrackColumn.renderArtists = function(track) {
    return TrackColumn.renderTD(track.getArtistsByRole('Artist').map(function(a) {
        return a.name;
    }).join(', '));
};
