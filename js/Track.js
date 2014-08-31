//require_once(CrockfordSugar.js)
//require_once(Request.js)
//require_once(Data.Release.js)
//require_once(Data.Genre.js)
//require_once(Data.Tag.js)
//require_once(DataList.js)
//require_once(ArtistLink.js)

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

//Shorthand method to copy object by serialise/deserialise
Track.method('clone', function() {
    return new Track(JSON.parse(JSON.stringify(this)));
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

//Method to find a given ArtistLink (or plain obj) and change it
Track.method('setArtistLink', function(o, n) {
    //Iterate ArtistLink array
    this.artistLinks.some(function(al) {
        //Continue iterating if Artist objs don't match
        if(al.artist.id != o.artist.id) return false;
        //Continue iterating if Role objs don't match
        if(al.role.id != o.role.id) return false;
        //Update matching ArtistLink obj
        al.artist = n.artist;
        al.role = n.role;
        //Stop iterating
        return true;
    });
});

//Method to find & remove a given ArtistLink (or plain obj)
Track.method('removeArtistLink', function(al) {
    //Start iterating ArtistLink array
    this.artistLinks.some(function(x, i, a) {
        //Continue iterating if Artist objs don't match
        if(x.artist.id != al.artist.id) return false;
        //Continue iterating if Role objs don't match
        if(x.role.id != al.role.id) return false;
        //Remove matching ArtistLink & stop iterating
        a.splice(i, 1);
        return true;
    });
});

//Static method which requests an (optionally filtered) list of tracks from
//the DB and passes a list of Track objects to the provided callback
Track.load = function(cb, f) {
    return Request.Get('Track', f?f.constraint():null)
        .process(function(response) {
            //Abort if Request failed (not sure how best to handle failure here)
            if(!response.success) return;
            //Invoke callback on success
            cb(response.data.map(function(t) {
                return new Track(t);
            }));
        })
    ;
};
