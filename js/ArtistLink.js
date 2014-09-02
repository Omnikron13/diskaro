//require_once(CrockfordSugar.js)
//require_once(Data.Artist.js)

function ArtistLink(json) {
    this.artistID = json.artistID;
    this.roleID = json.roleID;
}

ArtistLink.method('isRole', function(role) {
    if(typeof role == 'object') //Probablt Data obj
        return this.roleID == role.id;
    if(typeof role == 'number') //Probably an id
        return this.roleID == role;
});
