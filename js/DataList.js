//require_once(CrockfordSugar.js)
//require_once(Array.js)

//Class for working with lists of .type objects
function DataList(type, items) {
    this.type = type;
    this.list = items;
};

//Method to return an id indexed array-like-obj from .list
DataList.method('getIdIndex', function() {
    //If the index already exists, simply return it
    if(this.index) return this.index;
    //Init the actual obj
    this.index = {};
    //Store this for closure
    var that = this;
    //Iterate .list array & populate index
    this.list.forEach(function(d) {
        that.index[d.id] = d;
    });
    //Return the new index
    return this.index;
});

//Method to return array of all stored Data obj .id properties
DataList.method('getIDs', function() {
    return Object.getOwnPropertyNames(this.getIdIndex());
});

//Method to filter parentless Data objects from .list
DataList.method('getRoots', function() {
    return this.list.filter(function(d) {
        return d.parentIDs.length == 0;
    });
});

//Method to filter childless Data objects from .list
DataList.method('getLeaves', function() {
    return this.list.filter(function(d) {
        return d.childIDs.length == 0;
    });
});

//Method to return a subset DataList from id array (N.b. Behaviour when
//requesting ids not present in the list is undefined)
DataList.method('getSubset', function(ids) {
    //Get/store id index (save on method calls)
    var index = this.getIdIndex();
    //Return new DataList obj
    return DataList[this.type](ids.map(function(id) {
        return index[id];
    }));
});

//Method to return a (shallow) copy of the DataList
DataList.method('clone', function() {
    return new DataList(this.type, this.list.slice(0));
});

//Method to check if a given Data object is in the list
DataList.method('contains', function(d) {
    //Assume it cannot be if types don't match
    if(this.type != d.type) return false;
    //Check & return whether given Data objs .id is in the index
    return this.getIdIndex().hasOwnProperty(d.id);
});

//Method for adding new (unique) Data objects to the list
DataList.method('add', function(d) {
    //Fail if types don't match
    if(d.type != this.type) return this;
    //Fail if d is already in the list
    if(this.contains(d)) return this;
    //Add item to list
    this.list.push(d);
    //Add item to index
    this.getIdIndex()[d.id] = d;
    //Return this (allows chaining)
    return this;
});

//Method for removing Data objects from the list
DataList.method('remove', function(d) {
    //Abort if given Data obj isn't in the list
    if(!this.contains(d)) return this;
    //Get index (& perhaps create JIT)
    var i = this.getIdIndex();
    //Remove Data obj from list
    this.list.splice(this.list.indexOf(i[d.id]), 1);
    //Remove Data obj from index
    delete i[d.id];
    //Return this (allows chaining)
    return this;
});

//Method for replacing a given Data obj with another Data obj
DataList.method('replace', function(o, n) {
    //Abort if given old Data obj isn't in the list
    if(!this.contains(o)) return this;
    //Abort if given new Data obj isn't the stored type
    if(this.type != n.type) return this;
    //Abort if given new Data obj /is/ in the list
    if(this.contains(n)) return this;
    //Delegate to .add()/.remove() & return this (allows chaining)
    return this
        .remove(o)
        .add(n)
    ;
});

//Method to update a given Data obj 'in place' (not breaking refs)
DataList.method('update', function(d) {
    //Abort if given Data obj isn't in the list
    if(!this.contains(d)) return this;
    //Delegate updating to appropriate Data obj
    this.getIdIndex()[d.id].update(d);
    return this;
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

//Namespace for callbacks to .sort() arrays of DataList objects
DataList.Sort = {
    //Var controlling where to sort empty against non-empty list
    //(-1 for empty at top, 1 for empty at bottom)
    nullSort: -1,

    //Function to sort in ascending order
    Asc: function(a, b) {
        //Both empty; no sort
        if(a.list.length == 0 && b.list.length == 0)
            return 0;
        //First empty; sort by nullSort setting
        if(a.list.length == 0)
            return DataList.Sort.nullSort;
        //Second empty; sort by nullSort setting
        if(b.list.length == 0)
            return DataList.Sort.nullSort - DataList.Sort.nullSort * 2;
        //Sort by concatenated Data obj .name
        return a.toString().localeCompare(b.toString());
    },

    //Function to sort in descending order
    Desc: function(a, b) {
        //Both empty; no sort
        if(a.list.length == 0 && b.list.length == 0)
            return 0;
        //First empty; sort by nullSort setting
        if(a.list.length == 0)
            return DataList.Sort.nullSort;
        //Second empty; sort by nullSort setting
        if(b.list.length == 0)
            return DataList.Sort.nullSort - DataList.Sort.nullSort * 2;
        //Sort by concatenated Data obj .name
        return b.toString().localeCompare(a.toString());
    },
};
