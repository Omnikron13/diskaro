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

/*-------------------------*
 | Data class enhancements |
 *-------------------------*/
//Method to convert parentIDs to DataList (accessed by callback)
Data.method('getParentList', function(cb) {
    //Abort if Data obj doesn't support parents
    if(!this.hasOwnProperty('parentIDs')) return this;
    //Check if Data obj actually /has/ any parents
    if(this.parentIDs.length == 0) {
        //It doesn't; pass empty DataList to callback & abort
        cb(DataList[this.type]([]));
        return this;
    }
    //Save this for closure
    var that = this;
    //Defer til DataList.All.* is loaded
    $.when(DataList.All.loaded(this.type))
        .done(function() {
            cb(DataList.All[that.type].getSubset(that.parentIDs));
        });
    return this;
});

//Method to convert childIDs to DataList (accessed by callback)
Data.method('getChildList', function(cb) {
    //Abort if Data obj doesn't support children
    if(!this.hasOwnProperty('childIDs')) return this;
    //Check if Data obj actually /has/ any children
    if(this.childIDs.length == 0) {
        //It doesn't; pass empty DataList to callback & abort
        cb(DataList[this.type]([]));
        return this;
    }
    //Save this for closure
    var that = this;
    //Defer til DataList.All.* is loaded
    $.when(DataList.All.loaded(this.type))
        .done(function() {
            cb(DataList.All[that.type].getSubset(that.childIDs));
        });
    return this;
});

//Override .update() to maintain master list integrity on parent/child changes
Data.method('update', function(d) {
    //Abort update if type or id don't match
    if(d.type != this.type) return this;
    if(d.id != this.id) return this;
    //Store this for closures
    var that = this;
    //Update name
    this.name = d.name;
    //Update parent/child ids (if appropriate)
    if(this.hasOwnProperty('parentIDs')) {
        //Defer til master list is loaded
        $.when(DataList.All.loaded(this.type)).done(function() {
            //Get master id index
            var index = DataList.All[that.type].getIdIndex();
            //Get & iterate added/new parentIDs
            d.parentIDs.diff(that.parentIDs).forEach(function(id) {
                //Add parent/child links
                that.addParent(index[id]);
            });
            //Get & iterate removed parentIDs
            that.parentIDs.diff(d.parentIDs).forEach(function(id) {
                //Remove parent/child links
                that.removeParent(index[id]);
            });
        });
    }
    if(this.hasOwnProperty('childIDs')) {
        //Defer til master list is loaded
        $.when(DataList.All.loaded(this.type)).done(function() {
            //Get master id index
            var index = DataList.All[that.type].getIdIndex();
            //Get & iterate added/new childIDs
            d.childIDs.diff(that.childIDs).forEach(function(id) {
                //Add child/parent links
                that.addChild(index[id]);
            });
            //Get & iterate removed childIDs
            that.childIDs.diff(d.childIDs).forEach(function(id) {
                //Remove child/parent links
                that.removeChild(index[id]);
            });
        });
    }
    //Enable chaining
    return this;
});
