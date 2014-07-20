//require_once(CrockfordSugar.js)

//Class for working with lists of .type objects
function DataList(type, items) {
    this.type = type;
    this.list = items;
    this.callbacks = {
        itemClick: []
    };
};

//Render the list as a <ul> DOM element
DataList.method('renderUL', function() {
    var that = this;
    return $('<ul>')
        .addClass('dataList')
        .addClass(this.type.toLowerCase()+'List')
        .append($.map(this.list, function(d, i) {
            return d.renderLI()
                .on('click', function() {
                    that.processCallbacks('itemClick', i);
                })
            ;
        }))
    ;
});

//Register a new callback function in the .callbacks array
DataList.method('addCallback', function(e, cb) {
    this.callbacks[e].push(cb);
    return this;
});

//Process the registered callbacks for a given event, passing each a .type 
//object and the internal index of the object
DataList.method('processCallbacks', function(e, i) {
    var that = this;
    this.callbacks[e].forEach(function(cb) {
        cb(that.list[i], i);
    });
    return this;
});
