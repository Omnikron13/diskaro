//require_once(CrockfordSugar.js)
//require_once(Data.Artist.js)

function ArtistLink(json) {
    this.artist = Data.Artist(json.artist);
    this.role = Data.Role(json.role);
}

ArtistLink.method('isRole', function(role) {
    if(typeof role == 'object') //Probablt Data obj
        return this.roleID == role.id;
    if(typeof role == 'number') //Probably an id
        return this.roleID == role;
});
