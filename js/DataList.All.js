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
            //Override .add() method to update id refs bidirectionally
            DataList.All[type].add = function(d) {
                //Call original .add() to perform basic add
                DataList.prototype.add.call(this, d);
                //Abort if the original .add() appears to have failed
                if(!this.getIdIndex()[d.id]) return this;
                //Update parentIDs bidirectionally (if applicable)
                if(d.hasOwnProperty('parentIDs'))
                    d.getParents().list.forEach(function(p) {
                        p.addChild(d);
                    });
                //Update childIDs bidirectionally (if applicable)
                if(d.hasOwnProperty('childIDs'))
                    d.getChildren().list.forEach(function(c) {
                        c.addParent(d);
                    });
                //Update (Release) labelID birectionally (if applicable)
                if(d.labelID)
                    DataList.All.Label.getIdIndex()[d.labelID].addRelease(d);
                //Update (Label) releaseIDs birectionally (if applicable)
                if(d.hasOwnProperty('releaseIDs'))
                    d.getReleases().list.forEach(function(r) {
                        r.setLabel(d);
                    });
                //Enable chaining
                return this;
            };
            return DataList.All[type];
        });
    },
};

/*-------------------------*
 | Data class enhancements |
 *-------------------------*/
//Getter method to return DataList of parents from .parentIDs
Data.method('getParents', function() {
    //Abort if Data obj doesn't support parents
    if(!this.hasOwnProperty('parentIDs')) return null;
    return DataList.All[this.type].getSubset(this.parentIDs);
});

//Getter method to return DataList of children from .childIDs
Data.method('getChildren', function() {
    //Abort if Data obj doesn't support children
    if(!this.hasOwnProperty('childIDs')) return null;
    return DataList.All[this.type].getSubset(this.childIDs);
});

//Setter method to set parentIDs from id-array/DataList
Data.method('setParents', function(dl) {
    //Abort if Data obj doesn't support parents
    if(!this.hasOwnProperty('parentIDs')) return this;
    //If passed a DataList, get id array
    if(dl instanceof DataList) dl = dl.getIDs();
    this.parentIDs = dl;
    //Enable chaining
    return this;
});

//Setter method to set childIDs from id-array/DataList
Data.method('setChildren', function(dl) {
    //Abort if Data obj doesn't support children
    if(!this.hasOwnProperty('childIDs')) return this;
    //If passed a DataList, get id array
    if(dl instanceof DataList) dl = dl.getIDs();
    this.childIDs = dl;
    //Enable chaining
    return this;
});

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
    //Data.Release specific updates
    if(this.type == 'Release') {
        //Update Label id/obj if applicable
        if(d.labelID != this.labelID) {
            //Remove ref to this from old Label (if applicable)
            var o = this.getLabel();
            if(o) o.removeRelease(this);
            //Add ref to this to new Label (if applicable)
            var n = d.getLabel();
            if(n) n.addRelease(this);
            //Update stored Label id/obj
            this.setLabel(n);
        }
    }
    //Data.Label specific updates
    if(this.type == 'Label') {
        //Get id index of all Data.Release objects
        var index = DataList.All.Release.getIdIndex();
        //Iterate over newly added Release IDs
        d.releaseIDs.diff(this.releaseIDs).forEach(function(rid) {
            index[rid].setLabel(that);
        });
        //Iterate over now removed Release IDs
        this.releaseIDs.diff(d.releaseIDs).forEach(function(rid) {
            index[rid].setLabel(null);
        });
    }
    //Enable chaining
    return this;
});

/*---------------------------*
 | Data.Release enhancements |
 *---------------------------*/

//Getter to return Data.Label obj (or null) from stored labelID
Data.method('getLabel', function() {
    //Abort if this isn't a Data.Release
    if(this.type != 'Release') return null;
    //Return null if this Release has no Label id
    if(!this.labelID) return null;
    //If Data.Label obj isn't cached, convert labelID
    if(!this.labelObj)
        this.labelObj = DataList.All.Label.getIdIndex()[this.labelID];
    //Return (cached) Data.Label obj
    return this.labelObj;
});

//Setter to change stored Label id & obj from given Label obj/id
Data.method('setLabel', function(l) {
    //Abort if this isn't a Data.Release
    if(this.type != 'Release') return this;
    //If passed null/undefined/etc. null Release Label
    if(!l) {
        this.labelID = null;
        this.labelObj = null;
        return this;
    }
    //If passed int assume id & get Label obj
    if(Number.isInteger(l))
        l = DataList.All.Label.getIdIndex()[l];
    //Set Release Label & return this for chaining
    this.labelID = l.id;
    this.labelObj = l;
    return this;
});


/*-------------------------*
 | Data.Label enhancements |
 *-------------------------*/

//Getter to return Release DataList converted from .releaseIDs
Data.method('getReleases', function() {
    //Abort if this isn't a Data.Label
    if(this.type != 'Label') return null;
    //Return new DataList of Release objs referencing this
    return DataList.All.Release.getSubset(this.releaseIDs);
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

//Shorthand to get this Track obj's Data.Releas .year (or null)
Track.method('getYear', function() {
    var r = this.getRelease();
    return r ? r.year : null;
});

//Shorthand for this Track objs Data.Release .getLabel()
Track.method('getLabel', function() {
    var r = this.getRelease();
    return r ? r.getLabel() : null;
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

//Getter to return (unique) Artist DataList from .artistLinks
Track.method('getArtists', function() {
    return DataList.Artist($.unique(
        this.artistLinks.map(function(al) {
            return al.getArtist();
        })
    ));
});

//Getter to return (unique) Role DataList from .artistLinks
Track.method('getRoles', function() {
    return DataList.Role($.unique(
        this.artistLinks.map(function(al) {
            return al.getRole();
        })
    ));
});

//Getter to return Artist DataList from .artistLinks, filtered by role
Track.method('getArtistsByRole', function(role) {
    return DataList.Artist(
        //Filter down ArtistLink objects
        this.artistLinks.filter(function(link) {
            return link.isRole(role);
        })
            //Extract Artist objects from ArtistLinks
            .map(function(link) {
                return link.getArtist();
            })
    );
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

/*-------------------------------*
 | ArtistLink class enhancements |
 *-------------------------------*/

//Getter to return Data.Role obj (or null) from stored roleID
ArtistLink.method('getRole', function() {
    //If a Data.Role obj isn't cached, convert roleID
    if(!this.roleObj)
        this.roleObj = DataList.All.Role.getIdIndex()[this.roleID];
    //Return (cached) Data.Role obj
    return this.roleObj;
});

//Getter to return Data.Artist obj (or null) from stored artistID
ArtistLink.method('getArtist', function() {
    //If a Data.Artist obj isn't cached, convert artistID
    if(!this.artistObj)
        this.artistObj = DataList.All.Artist.getIdIndex()[this.artistID];
    //Return (cached) Data.Artist obj
    return this.artistObj;
});

//Override .isRole() to allow checking by .name
ArtistLink.method('isRole', function(r) {
    //If passed string, check against Role .name
    if(typeof r == 'string')
        return r == this.getRole().name;
    //If passed int, check against id
    if(Number.isInteger(r))
        return r == this.roleID;
    //Not str or int, assume object; check id
    return r.id == this.roleID;
});
