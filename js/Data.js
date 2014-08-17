//require_once(CrockfordSugar.js)
//require_once(Request.js)

//Base constructor for Data (PHP [Sub]DataCore) objects
function Data(type, json) {
    this.type = type;
    this.id = json.id;
    this.name = json.name;
    if(json.hasOwnProperty('parentIDs'))
        this.parentIDs = json.parentIDs;
};

//'Magic' method to ensure correct generic JSON encoding
Data.method('toJSON', function() {
    var j = {
        id: this.id,
        name: this.name,
    };
    if(this.hasOwnProperty('parentIDs'))
        j.parentIDs = this.parentIDs;
    return j;
});

//Static method which requests an (optionally filtered) list of 'type' data
//from the DB and passes a list of Data objects to the provided callback
Data.load = function(type, cb, f) {
    return new Request(type, f?f.constraint():null)
        .pull(function(json) {
            cb(json.map(function(d) {
                return Data[type](d);
            }));
        })
    ;
};
