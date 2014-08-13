//require_once(CrockfordSugar.js)
//require_once(Request.js)
//require_once(Data.Release.js)
//require_once(Data.Genre.js)
//require_once(Data.Tag.js)
//require_once(DataList.js)
//require_once(ArtistLink.js)
//require_once(TrackColumn.js)

//Track constructor - constructs a usable Track object from serialised form
function Track(json) {
    this.id = json.id;
    this.name = json.name;
    this.path = json.path;
    //Set release or null/unknown
    this.release = json.release === null?
        null:
        Data.Release(json.release);
    this.trackNumber = json.trackNumber===null?'':json.trackNumber;
    //Convert genres to DataList
    this.genres = DataList.Genre(
        json.genres.map(function(g) {
            return Data.Genre(g);
        })
    ).sort();
    //Convert tags to DataList
    this.tags = DataList.Tag(
        json.tags.map(function(t) {
            return Data.Tag(t);
        })
    ).sort();
    this.artistLinks = json.artistLinks.map(function(link) {
        return new ArtistLink(link);
    });
};

//'Magic' method to ensure correct JSON encoding
Track.method('toJSON', function() {
    return {
        id          : this.id,
        name        : this.name,
        path        : this.path,
        release     : this.release,
        trackNumber : this.trackNumber,
        genres      : this.genres,
        tags        : this.tags,
        artistLinks : this.artistLinks,
    };
});

//Generate a <tr> element of the track from given TrackColumns
Track.method('renderTR', function(columns) {
    var that = this;
    return $('<tr>')
        //Add generic selection class
        .addClass('trackItem')
        //Store original Track obj
        .data('track', this)
        //Render mouseover text
        .attr('title', this.getTitleString())
        //Render cells
        .append($.map(columns, function(c) {
            return c.renderTD(that);
        }))
    ;
});

//Should probably be more flexible/configurable
Track.method('getTitleString', function() {
    var that = this;
    var str = '';
    this.getRoles().list.forEach(function(r) {
        str += _(r.name)
            + ': '
            + that.getArtistsByRole(r).toString(', ')
            + '\n';
    });
    return str;
});

//Method to get DataList of unique artists (no role info...)
Track.method('getArtists', function() {
    return DataList.Artist(
        //Remove duplicates
        $.unique(
            //Extract Artist objects from ArtistLinks
            this.artistLinks.map(function(link) {
                return link.artist;
            })
        )
    );
});

//Method to get DataList of unique roles (no artist info...)
// breaks $.unique() on nulls!
Track.method('getRoles', function() {
    return DataList.Role(
        //Remove duplicates
        $.unique(
            //Extract Role objects from ArtistLinks
            this.artistLinks.map(function(link) {
                return link.role;
            })
        )
    );
});

//Returns an array of artist objects filtered by role
Track.method('getArtistsByRole', function(role) {
    return DataList.Artist(
        //Filter down ArtistLink objects
        this.artistLinks.filter(function(link) {
            return link.isRole(role);
        })
            //Extract Artist objects from ArtistLinks
            .map(function(link) {
                return link.artist;
            })
    );
});

//Static method which requests an (optionally filtered) list of tracks from
//the DB and passes a list of Track objects to the provided callback
Track.load = function(cb, f) {
    return new Request('Track', f?f.constraint():null)
        .pull(function(json) {
            cb(json.map(function(t) {
                return new Track(t);
            }));
        })
    ;
};
