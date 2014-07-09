//require_once(CrockfordSugar.js)
//require_once(Release.js)
//require_once(Genre.js)
//require_once(ArtistLink.js)

//Track constructor - constructs a usable Track object from serialised form
function Track(json) {
    this.id = json.id;
    this.name = json.name;
    this.release = new Release(json.release);
    this.trackNumber = json.trackNumber===null?'':json.trackNumber;
    this.genres = json.genres.map(function(g) {
        return new Genre(g);
    });
    this.tags = json.tags; //should be objects
    this.artistLinks = json.artistLinks.map(function(link) {
        return new ArtistLink(link);
    });
};

//Generates a DOM element object to display the Track
Track.method('getElement', function() {
    var element = document.createElement('tr');
    element.setAttribute('class', 'trackItem');
    element.setAttribute('title', this.getTitleString());
    //Add column data 
    element.appendChild(this.getTrackNumberTD());
    element.appendChild(this.getTitleTD());
    element.appendChild(this.getRoleTD('Artist'));
    element.appendChild(this.getReleaseTD());
    element.appendChild(this.getGenresTD());
    return element;
});

//Methods for generating <td> DOM elements for various kinds of track info
//These may need to be replaced with a more configurable system
Track.method('getTrackNumberTD', function() {
    return this.getTDElement(this.trackNumber);
});

Track.method('getTitleTD', function() {
    return this.getTDElement(this.name);
});

Track.method('getReleaseTD', function() {
    return this.getTDElement(this.release.name);
});

Track.method('getGenresTD', function() {
    return this.getTDElement(this.genres.map(function(g) {
        return g.name;
    }).join(', '));
});

Track.method('getRoleTD', function(role) {
    return this.getTDElement(this.getArtistsByRole(role).map(function(a) {
        return a.name;
    }).join(', '));
});

//Method for generating <td> elements with arbitrary innerHTML
Track.method('getTDElement', function(html) {
    var element = document.createElement('td');
    element.innerHTML = html;
    return element;
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
