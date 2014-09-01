//require_once(DataList.js)

//Namespace for accessing DataList objects holding complete lists of a given type
DataList.All = {
    //Function to check (using $.when()) if a list is loaded & load it if not
    loaded: function(type) {
        //No type specified; defer til all types are loaded
        if(!type) {
            return $.when(
                DataList.All.loaded('Artist'),
                DataList.All.loaded('Genre'),
                DataList.All.loaded('Label'),
                DataList.All.loaded('Release'),
                DataList.All.loaded('Role'),
                DataList.All.loaded('Tag')
            );
        }
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

/*--------------------------*
 | Track class enhancements |
 *--------------------------*/

//Getter to return Data obj (or null) from stored releaseID
Track.method('getRelease', function() {
    //Return null immediately if releaseID is nulled
    if(!this.releaseID) return null;
    //If a Data.Release obj isn't cached, convert relaseID
    if(!this.releaseObj)
        this.releaseObj = DataList.All.Release.getIdIndex()[this.releaseID];
    //Return (cached) Data.Release obj
    return this.releaseObj;
});

//Getter to return DataList obj from stored genreIDs
Track.method('getGenres', function() {
    //If Genre DataList isn't cached, convert genreIDs
    if(!this.genreList)
        this.genreList = DataList.All.Genre.getSubset(this.genreIDs);
    //Return (cached) DataList
    return this.genreList.sort();
});

//Getter to return DataList obj from stored tagIDs
Track.method('getTags', function() {
    //If Tag DataList isn't cached, convert tagIDs
    if(!this.tagList)
        this.tagList = DataList.All.Tag.getSubset(this.tagIDs);
    //Return (cached) DataList
    return this.tagList.sort();
});

//Setter to change stored Release id/obj from given Release obj
Track.method('setRelease', function(r) {
    //If passed null/undefined/etc. null Track release
    if(!r) {
        this.releaseID = null;
        this.releaseObj = null;
        return this;
    }
    //If passed int assume id & get Release obj
    if(Number.isInteger(r))
        r = DataList.All.Release.getIdIndex()[r];
    //Set Track release & return this for chaining
    this.releaseID = r.id;
    this.releaseObj = r;
    return this;
});

//Setter to change stored Genre id array/DataList from given id array/DataList
Track.method('setGenres', function(gl) {
    //If not passed a DataList assume id array & convert
    if(!gl instanceof DataList)
        gl = DataList.All.Genre.getIdIndex().getSubset(gl);
    //Set Genre id array & (cached) DataList
    this.genreIDs = gl.getIDs();
    this.genreList = gl;
    //Enable chaining
    return this;
});

//Setter to change stored Tag id array/DataList from given id array/DataList
Track.method('setTags', function(tl) {
    //If not passed a DataList assume id array & convert
    if(!tl instanceof DataList)
        tl = DataList.All.Tag.getIdIndex().getSubset(tl);
    //Set Tag id array & (cached) DataList
    this.tagIDs = tl.getIDs();
    this.tagList = tl;
    //Enable chaining
    return this;
});
