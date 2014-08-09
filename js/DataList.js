//require_once(CrockfordSugar.js)

//Class for working with lists of .type objects
function DataList(type, items) {
    this.type = type;
    this.list = items;
    this.callbacks = {
        itemClick: []
    };
};

//Default toString() - join names, optionally with glue
DataList.method('toString', function(glue) {
    glue = glue || '';
    return this.list.map(function(d) {
        return d.name;
    }).join(glue);
});

//Sort the underlying array, optionally with arbitrary sort
DataList.method('sort', function(cb) {
    this.list.sort(cb || function(a, b) {
        return a.name.localeCompare(b.name);
    });
    return this;
});

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
    if(!this.callbacks.hasOwnProperty(e))
        this.callbacks[e] = [];
    this.callbacks[e].push(cb);
    return this;
});

//Process the registered callbacks for a given event, passing each a .type 
//object and the internal index of the object
DataList.method('processCallbacks', function(e, i) {
    if(!this.callbacks.hasOwnProperty(e)) return this;
    var that = this;
    this.callbacks[e].forEach(function(cb) {
        cb(that.list[i], i);
    });
    return this;
});

//Shorthand static to create Artist DataList objects
DataList.Artist = function(artists) {
    return new DataList('Artist', artists);
};

//Shorthand static to create Genre DataList objects
DataList.Genre = function(genres) {
    return new DataList('Genre', genres);
};

//Shorthand static to create Release DataList objects
DataList.Release = function(releases) {
    return new DataList('Release', releases);
};

//Shorthand static to create Role DataList objects
DataList.Role = function(roles) {
    return new DataList('Role', roles);
};

//Shorthand static to create Label DataList objects
DataList.Label = function(labels) {
    return new DataList('Label', labels);
};

//Shorthand static to create Tag DataList objects
DataList.Tag = function(tags) {
    return new DataList('Tag', tags);
};

//Namespace for accessing DataList objects holding complete lists of a given type
DataList.All = {
    //Function to check (using $.when()) if a list is loaded & load it if not
    loaded: function(type) {
        //If type has been loaded previously return the loaded /array/
        if(DataList.All.hasOwnProperty(type)) return DataList.All[type];
        //Request all [type] records from the DB
        return Data.load(type, function(ds) {
            //Late check to see if another async request got there first
            if(DataList.All.hasOwnProperty(type)) return DataList.All[type];
            //Create list from loaded data & return it
            DataList.All[type] = new DataList(type, ds);
            return DataList.All[type];
        });
    },
};
