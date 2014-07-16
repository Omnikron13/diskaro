//require_once(CrockfordSugar.js)
//require_once(Request.js)

function Genre(json) {
    this.id = json.id;
    this.name = json.name;
    this.parentIDs = json.parentIDs;
};
