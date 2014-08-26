//require_once(CrockfordSugar.js)

//Class for working with lists of .type objects
function DataList(type, items) {
    this.type = type;
    this.list = items;
    this.callbacks = {
        itemClick: []
    };
};

//Method to create an id indexed array-like-obj from .list
DataList.method('getIdIndex', function() {
    var index = {};
    this.list.forEach(function(d) {
        index[d.id] = d;
    });
    return index;
});

//Method to filter parentless Data objects from .list
DataList.method('getRoots', function() {
    return this.list.filter(function(d) {
        return d.parentIDs.length == 0;
    });
});

//Method to check if a given Data object is in the list
DataList.method('contains', function(d) {
    //Assume it cannot be if types don't match
    if(this.type != d.type) return false;
    //Check for id match
    return this.list.some(function(x) {
        return d.id == x.id;
    });
});

//Method for adding new (unique) Data objects to the list
DataList.method('add', function(d) {
    //Fail if types don't match
    if(d.type != this.type) return this;
    //Fail if d is already in the list
    if(this.contains(d)) return this;
    //Add the item
    this.list.push(d);
    return this;
});

//Method for removing Data objects from the list
DataList.method('remove', function(d) {
    //Abort if given Data obj isn't the stored type
    if(this.type != d.type) return this;
    //Init variable to hold matching index (if any)
    var index = -1;
    //Iterate Data objects
    this.list.some(function(x, i) {
        //Continue iterating if no match
        if(d.id != x.id) return false;
        //Set matching index var & stop iterating
        index = i;
        return true;
    });
    //Remove matching Data obj (if any)
    if(index > -1)
        this.list.splice(index, 1);
    return this;
});

//Method for replacing a given Data obj with another Data obj
DataList.method('replace', function(o, n) {
    //Abort if given old Data obj isn't the stored type
    if(this.type != o.type) return this;
    //Abort if given new Data obj isn't the stored type
    if(this.type != n.type) return this;
    //Save this for closure
    var that = this;
    //Iterate Data objects
    this.list.some(function(x, i) {
        //Continue iterating if no match
        if(o.id != x.id) return false;
        //Replace Data obj at index & stop iterating
        that.list[i] = n;
        return true
    });
});

//Default toString() - join names, optionally with glue
DataList.method('toString', function(glue) {
    glue = glue || '';
    return this.list.map(function(d) {
        return d.name;
    }).join(glue);
});

//'Magic' method to ensure correct JSON encoding
DataList.method('toJSON', function() {
    return this.list;
});

//Sort the underlying array, optionally with arbitrary sort
DataList.method('sort', function(cb) {
    this.list.sort(cb || function(a, b) {
        return a.name.localeCompare(b.name);
    });
    return this;
});

//Sugar to allow DataList to be .map()'d like an array
DataList.method('map', function(cb, that) {
    return this.list.map(cb, that);
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
