//require_once(CrockfordSugar.js)
//require_once(Request.js)

//Base constructor for Data (PHP [Sub]DataCore) objects
function Data(type, json) {
    this.type = type;
    this.id = json.id;
    this.name = json.name;
    this.comments = json.comments;
    if(json.hasOwnProperty('parentIDs'))
        this.parentIDs = json.parentIDs;
    if(json.hasOwnProperty('childIDs'))
        this.childIDs = json.childIDs;
};

//Function to create a null/dummy/placeholder Data obj
Data.Null = function(type, name) {
    return new Data(
        type,
        {
            id   : 'null',
            name : name || _('Unknown'),
        }
    );
};

//'Magic' method to ensure correct generic JSON encoding
Data.method('toJSON', function() {
    var j = {
        id: this.id,
        name: this.name,
        comments: this.comments,
    };
    if(this.hasOwnProperty('parentIDs'))
        j.parentIDs = this.parentIDs;
    if(this.hasOwnProperty('childIDs'))
        j.childIDs = this.childIDs;
    return j;
});

//Shorthand method to copy object by serialise/deserialise
Data.method('clone', function() {
    return Data[this.type](JSON.parse(JSON.stringify(this)));
});

//Basic setter for .name (chainable)
Data.method('setName', function(s) {
    this.name = s;
    return this;
});

//Basic setter for .comments (chainable)
Data.method('setComments', function(s) {
    this.comments = s;
    return this;
});

//Method to add parent(ID) link (& matching child(ID) link)
Data.method('addParent', function(d) {
    //Abort if types don't match
    if(d.type != this.type) return this;
    //Abort if trying to add this as a parent of itself
    if(d.id == this.id) return this;
    //Add parent ID if not in array
    if(this.parentIDs.indexOf(d.id) == -1)
        this.parentIDs.push(d.id);
    //Add child ID to parent (if not in array)
    if(d.childIDs.indexOf(this.id) == -1)
        d.childIDs.push(this.id);
    //Return this (enable chaining)
    return this;
});

//Method to remove parent(ID) link (& matching child(ID) link)
Data.method('removeParent', function(d) {
    //Abort if types don't match
    if(d.type != this.type) return this;
    //Get array index of given parent(ID)
    var i = this.parentIDs.indexOf(d.id);
    //Remove parent(ID) if exists
    if(i != -1) this.parentIDs.splice(i, 1);
    //Get array index of corresponding child link
    var i = d.childIDs.indexOf(this.id);
    //Remove child(ID) if exists
    if(i != -1) d.childIDs.splice(i, 1);
    //Return this (enable chaining)
    return this;
});

//Method to add child(ID) link (& matching parent(ID) link)
Data.method('addChild', function(d) {
    //Delegate to .addParent() & return
    d.addParent(this);
    return this;
});

//Method to remove child(ID) link (& matching parent(ID) link)
Data.method('removeChild', function(d) {
    //Delegate to .removeParent() & return
    d.removeParent(this);
    return this;
});

//Method to update Data obj props 'in place' (won't break refs)
Data.method('update', function(d) {
    //Abort update if type or id don't match
    if(d.type != this.type) return this;
    if(d.id != this.id) return this;
    //Update name
    this.name = d.name;
    //Update comments
    this.comments = d.comments;
    //Delegate further updates & return (chaining enabled)
    return this
        .updateParents(d.parentIDs)
        .updateChildren(d.childIDs)
    ;
});

//Method to update/replace .parentIDs array (if appliable)
Data.method('updateParents', function(pids) {
    //Replace array (if parents are supported)
    if(pids) this.parentIDs = pids;
    //Enable chaining
    return this;
});

//Method to update/replace .childIDs array (if applicable)
Data.method('updateChildren', function(cids) {
    //Replace array (if children are supported)
    if(cids) this.childIDs = cids;
    //Enable chaining
    return this;
});

//Static method which requests an (optionally filtered) list of 'type' data
//from the DB and passes a list of Data objects to the provided callback
Data.load = function(type, cb, f) {
    return Request.Get(type, f?f.constraint():null)
        .process(function(response) {
            //Abort if Request failed (not sure how best to handle failure here)
            if(!response.success) return;
            //Invoke callback on success
            cb(response.data.map(function(d) {
                return Data[type](d);
            }));
        })
    ;
};
