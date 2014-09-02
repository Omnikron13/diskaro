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
    this.trackNumber = json.trackNumber===null?'':json.trackNumber;
    this.artistLinks = json.artistLinks.map(function(link) {
        return new ArtistLink(link);
    });
    //Store plain id references to other (Data) objs
    this.releaseID = json.releaseID;
    this.genreIDs = json.genreIDs;
    this.tagIDs = json.tagIDs;
};

//'Magic' method to ensure correct JSON encoding
Track.method('toJSON', function() {
    return {
        id          : this.id,
        name        : this.name,
        path        : this.path,
        trackNumber : this.trackNumber,
        artistLinks : this.artistLinks,
        //Serialise plain id references
        releaseID   : this.releaseID,
        genreIDs    : this.genreIDs,
        tagIDs      : this.tagIDs,
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

//Setter method to set .trackNumber from int/string/null
Track.method('setTrackNumber', function(i) {
    //If given a string, attempt to convert it to int
    if(typeof i == 'string')
        i = Number.parseInt(i, 10);
    //Update track number to new int or null it
    this.trackNumber = Number.isNaN(i) ? null : i;
    //Enable chaining
    return this;
});

//Setter to completely replace ArtistLink array
Track.method('setArtistLinks', function(al) {
    this.artistLinks = al;
    return this;
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
