//require_once(Data.js)
//require_once(Data.Label.js)

//Pseudo-constructor for creating release Data objects
Data.Release = function(json) {
    var r = new Data('Release', json);
    r.year = json.year;
    //Store id reference to Data.Label or null
    r.labelID = json.labelID;
    //Override generic .toJSON() from Data to include year & label
    r.toJSON = function() {
        return {
            id      : r.id,
            name    : r.name,
            year    : r.year,
            labelID : r.labelID,
        };
    };
    //Override generic .update() to update year/label
    r.update = function(d) {
        //Abort update if type or id don't match
        if(d.type != this.type) return this;
        if(d.id != this.id) return this;
        //Call generic .update()
        Data.prototype.update.call(this, d);
        //Update Release specific properties
        this.year = d.year;
        //Update Data.Label id reference
        this.labelID = d.labelID;
        //Enable chaining
        return this;
    };
    //Add setter method to set year from int/str
    r.setYear = function(y) {
        //If given a str, attempt to convert to int
        if(typeof y == 'string')
            y = Number.parseInt(y, 10);
        //Set year to valid number or null (for unknown)
        this.year = Number.isNaN(y) ? null : y;
        //Enable chaining
        return this;
    };
    return r;
};

//Shorthand for using Data.load() to load releases
Data.Release.load = function(cb, f) {
    return Data.load('Release', cb, f);
};
