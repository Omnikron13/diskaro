//require_once(CrockfordSugar.js)
//require_once(Request.js)
//require_once(Data.Release.js)
//require_once(Data.Genre.js)
//require_once(Data.Tag.js)
//require_once(ArtistLink.js)
//require_once(TrackColumn.js)

//Track constructor - constructs a usable Track object from serialised form
function Track(json) {
    this.id = json.id;
    this.name = json.name;
    this.path = json.path;
    this.release = Data.Release(json.release);
    this.trackNumber = json.trackNumber===null?'':json.trackNumber;
    this.genres = json.genres.map(function(g) {
        return Data.Genre(g);
    });
    this.tags = json.tags.map(function(t) {
        return Data.Tag(t);
    });
    this.artistLinks = json.artistLinks.map(function(link) {
        return new ArtistLink(link);
    });
};

//Generate a <tr> element of the track from given TrackColumns
Track.method('renderTR', function(columns) {
    var that = this;
    return $('<tr>')
        .addClass('trackItem')
        .attr('title', this.getTitleString())
        .append($.map(columns, function(c) {
            return c.renderTD(that);
        }))
    ;
});

//Should probably be more flexible/configurable
Track.method('getTitleString', function() {
    var that = this;
    var str = '';
    this.getRoles().forEach(function(r) {
        str += r.name
            + ': '
            + that.getArtistsByRole(r).map(function(a) {
                return a.name;
              }).join(', ')
            + '\n';
    });
    return str;
});

//Method to get array of unique artists (no role info...)
Track.method('getArtists', function() {
    return $.unique(this.artistLinks.map(function(item) {
        return item.artist;
    }));
});

//Method to get array of unique roles (no artist info...)
// breaks $.unique() on nulls!
Track.method('getRoles', function() {
    return $.unique(this.artistLinks.map(function(item) {
        return item.role;
    }));
});

//Returns an array of artist objects filtered by role
Track.method('getArtistsByRole', function(role) {
    return this.artistLinks.filter(function(link) {
            return link.isRole(role);
        }).map(function(link) {
        return link.artist;
    });
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
