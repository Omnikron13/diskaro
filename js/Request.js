//require_once(CrockfordSugar.js)

//Construct a Request object from a class string & optional constraint.
//Request objects are used to pull data via DataCore::jsonRequest()
function Request(type, c) {
    this['class'] = type;
    this.constraint = c || {type:null};
};

//Static property holding the url of the server's request handling script
Request.url = 'getjson.php';

//Makes the request to the server and passes the results to a callback
Request.method('pull', function(cb) {
    return $.getJSON(Request.url, this.raw(), cb);
});

//Returns the request object stripped of all methods so it can be used by
//jQuery, which for some reason calls all the methods otherwise
Request.method('raw', function() {
    return {
        class: this.class,
        constraint: this.constraint
    };
});

//Static method which requests an (optionally filtered) list of 'type' data
//from the DB and passes a list of 'type' objects to the provided callback
Request.load = function(type, cb, f) {
    return new Request(type, f?f.constraint():null)
        .pull(function(json) {
            cb(json.map(function(d) {
                return new window[type](d);
            }));
        })
    ;
};
