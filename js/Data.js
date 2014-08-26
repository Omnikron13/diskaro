//require_once(CrockfordSugar.js)
//require_once(Request.js)

//Base constructor for Data (PHP [Sub]DataCore) objects
function Data(type, json) {
    this.type = type;
    this.id = json.id;
    this.name = json.name;
    if(json.hasOwnProperty('parentIDs'))
        this.parentIDs = json.parentIDs;
    if(json.hasOwnProperty('childIDs'))
        this.childIDs = json.childIDs;
};

//'Magic' method to ensure correct generic JSON encoding
Data.method('toJSON', function() {
    var j = {
        id: this.id,
        name: this.name,
    };
    if(this.hasOwnProperty('parentIDs'))
        j.parentIDs = this.parentIDs;
    if(this.hasOwnProperty('childIDs'))
        j.childIDs = this.childIDs;
    return j;
});

//Static method which requests an (optionally filtered) list of 'type' data
//from the DB and passes a list of Data objects to the provided callback
Data.load = function(type, cb, f) {
    return Request.Get(type, f?f.constraint():null)
        .process(function(response) {
            //Abort if Request failed (not sure how best to handle failure here)
            if(!response.success) return;
            //Invoke callback on success
            cb(response.data.map(function(d) {
                return Data[type](d);
            }));
        })
    ;
};
