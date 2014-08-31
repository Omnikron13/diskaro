//require_once(CrockfordSugar.js)
//require_once(Data.Artist.js)

function ArtistLink(json) {
    this.artist = Data.Artist(json.artist);
    this.role = Data.Role(json.role);
}

ArtistLink.method('isRole', function(role) {
    if(typeof role == 'object') //instanceof or somesuch when role object is ready?
        return this.role.id == role.id;
    if(typeof role == 'number') //Probably an id
        return this.role.id == role;
    if(typeof role == 'string') //Probably a name
        return this.role.name == role;
});
