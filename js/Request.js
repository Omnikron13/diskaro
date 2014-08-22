//require_once(CrockfordSugar.js)

//Construct a Request object from a class string & optional constraint.
//Request objects are used to pull data via DataCore::jsonRequest()
function Request(type, cls, data) {
    //Set common properties
    this.type = type;
    this['class'] = cls;
    //Init arbitrary data storage
    this.data = {};
    //Save this for closure
    var that = this;
    //Iterate passed arbitrary data obj
    $.each(data || {}, function(k, v) {
        //Store k:v pairs
        that.setData(k, v);
    });
};

//Static property holding the url of the server's request handling script
Request.url = 'getjson.php';

//Method to store arbitrary request data for specific types
Request.method('setData', function(k, v) {
    this.data[k] = v;
    return this;
});

//Makes the request to the server and passes the response to a callback
Request.method('process', function(cb) {
    return $.post(Request.url, this.toJSON(), cb);
});

//Magic method to convert to a plain obj for serialising/passing to server
Request.method('toJSON', function() {
    //Set common properties
    var json = {
        type  : this.type,
        class : this.class,
    };
    //Set arbitrary properties
    $.each(this.data, function(k, v) {
        json[k] = v;
    });
    return json;
});

//Shorthand for creating 'get' Request objects
Request.Get = function(cls, cons) {
    return new Request('get', cls)
        .setData('constraint', cons || {type:null})
    ;
};

//Shorthand for creating 'update' Request objects
Request.Update = function(cls, data) {
    return new Request('update', cls)
        .setData('data', JSON.stringify(data))
    ;
};

//Shorthand for creating 'add' Request objects
Request.Add = function(cls, data) {
    return new Request('add', cls)
        .setData('data', JSON.stringify(data))
    ;
};

//Shorthand for creating 'delete' Request objects
Request.Delete = function(cls, id) {
    return new Request('delete', cls)
        .setData('id', id)
    ;
};
