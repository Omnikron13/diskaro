//require_once(CrockfordSugar.js)
//require_once(DataList.UI.js)

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
    return TrackColumn.renderTD(DataList.UI.UL.render(track.genres));
};

TrackColumn.renderTags = function(track) {
    return TrackColumn.renderTD(DataList.UI.UL.render(track.tags));
};

TrackColumn.renderRole = function(role) {
    return function(track) {
        return TrackColumn.renderTD(
            DataList.UI.UL.render(track.getArtistsByRole(role))
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

//Utility function for sorting DataList cells
TrackColumn.sortDataList = function(a, b) {
    //Sort null/empty
    if(a.list.length == 0) return b.list.length==0?0:TrackColumn.nullSort;
    if(b.list.length == 0) return TrackColumn.nullSort - TrackColumn.nullSort * 2;
    //Sort non-null/not-empty
    return a.toString()
        .localeCompare(b.toString());
};

TrackColumn.sortGenres = function(a, b) {
    return TrackColumn.sortDataList(a.genres, b.genres);
};

TrackColumn.sortTags = function(a, b) {
    return TrackColumn.sortDataList(a.tags, b.tags);
};

TrackColumn.sortRole = function(role) {
    return function(a, b) {
        return TrackColumn.sortDataList(
            a.getArtistsByRole(role),
            b.getArtistsByRole(role)
        );
    }
};

//Default sort method - sorts nothing
TrackColumn.sortNull = function() {
    return 0;
};
