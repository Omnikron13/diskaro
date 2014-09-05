//require_once(Data.js)

//Pseudo-constructor for creating label Data objects
Data.Label = function(json) {
    var l = new Data('Label', json);
    l.releaseIDs = json.releaseIDs;
    //Override generic .toJSON() from Data to include releaseIDs
    l.toJSON = function() {
        //Get json obj from generic .toJSON()
        var json = Data.prototype.toJSON.call(this);
        //Add releaseIDs array & return
        json.releaseIDs = this.releaseIDs;
        return json;
    };
    //Override generic .update() to update releaseIDs
    l.update = function(d) {
        //Call generic .update()
        Data.prototype.update.call(this, d);
        //Update releaseIDs array
        this.releaseIDs = d.releaseIDs;
        //Enable chaining
        return this;
    };
    //Add method to add new Release id ref
    l.addRelease = function(r) {
        //If r isn't a number, assume Data obj & get id
        if(!Number.isInteger(r)) r = r.id;
        //If r isn't in the array, add it
        if(this.releaseIDs.indexOf(r) == -1)
            this.releaseIDs.push(r);
        //Enable chaining
        return this;
    };
    //Add method to remove given Release id ref
    l.removeRelease = function(r) {
        //If r isn't a number, assume Data obj & get id
        if(!Number.isInteger(r)) r = r.id;
        //Get index of given id
        var i = this.releaseIDs.indexOf(r);
        //If if is in array, remove it
        if(i != -1)
            this.releaseIDs.splice(i, 1);
        //Enable chaining
        return this;
    };
    return l;
};

//Shorthand for using Data.load() to load labels
Data.Label.load = function(cb, f) {
    return Data.load('Label', cb, f);
};

//Static method to create an empty Data.Label obj
Data.Label.New = function(name) {
    return Data.Label({
        name       : name,
        parentIDs  : [],
        childIDs   : [],
        releaseIDs : [],
    });
};
