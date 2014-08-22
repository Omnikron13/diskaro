//require_once(CrockfordSugar.js)

//Construct a Request object from a class string & optional constraint.
//Request objects are used to pull data via DataCore::jsonRequest()
function Request(type, cls, data) {
    //Set common properties
    this.type = type;
    this['class'] = cls;
    this.data = data;
};

//Static property holding the url of the server's request handling script
Request.url = 'getjson.php';

//Makes the request to the server and passes the response to a callback
Request.method('process', function(cb) {
    return $.post(Request.url, this.toJSON(), cb);
});

//Magic method to convert to a plain obj for serialising/passing to server
Request.method('toJSON', function() {
    return {
        type  : this.type,
        class : this.class,
        data  : this.data,
    };
});

//Shorthand for creating 'get' Request objects
Request.Get = function(cls, cons) {
    return new Request('get', cls, cons || {type:null});
};

//Shorthand for creating 'update' Request objects
Request.Update = function(cls, data) {
    return new Request('update', cls, JSON.stringify(data));
};

//Shorthand for creating 'add' Request objects
Request.Add = function(cls, data) {
    return new Request('add', cls, JSON.stringify(data));
};

//Shorthand for creating 'delete' Request objects
Request.Delete = function(cls, id) {
    return new Request('delete', cls, id);
};
