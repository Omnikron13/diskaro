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
    return l;
};

//Shorthand for using Data.load() to load labels
Data.Label.load = function(cb, f) {
    return Data.load('Label', cb, f);
};
