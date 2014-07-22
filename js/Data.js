//require_once(CrockfordSugar.js)
//require_once(Request.js)

//Base constructor for Data (PHP DataCore) objects
function Data(type, json) {
    this.type = type;
    this.id = json.id;
    this.name = json.name;
};

//Render the Data as an <li> DOM element
Data.method('renderLI', function() {
    return $('<li>')
        .addClass(this.type.toLowerCase()+'Item')
        .html(this.name)
    ;
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
