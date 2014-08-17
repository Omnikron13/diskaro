//require_once(CrockfordSugar.js)
//require_once(Request.js)

//Base constructor for Data (PHP [Sub]DataCore) objects
function Data(type, json) {
    this.type = type;
    this.id = json.id;
    this.name = json.name;
    if(json.hasOwnProperty('parentIDs'))
        this.parentIDs = json.parentIDs;
};

//'Magic' method to ensure correct generic JSON encoding
Data.method('toJSON', function() {
    var j = {
        id: this.id,
        name: this.name,
    };
    if(this.hasOwnProperty('parentIDs'))
        j.parentIDs = this.parentIDs;
    return j;
});

//Render the Data as a radio button wrapped in a span, using the optional
//prefix param to disambiguate id attributes if multiple buttons based on the
//same Data object are needed
Data.method('renderRadio', function(prefix) {
    //Set default values
    prefix = prefix || '';
    //Construct id/for attr string
    var idStr = prefix + this.type + 'Radio-' + this.id;
    //Render element
    return $('<span>')
        //Add class for generic selection
        .addClass('dataRadio')
        .addClass(this.type.toLowerCase()+'Radio')
        //Store Data obj in element
        .data('data', this)
        //Render button
        .append(
            $('<input>')
                .attr('id', idStr)
                .attr('type', 'radio')
                .attr('name', prefix + this.type)
                .val(this.id)
                //Catch input change & retarget it to the main span (which
                //will allow cleaner .data('data') access downstream)
                .on('change', function(ev) {
                    ev.stopPropagation();
                    $(this).parent().trigger('change');
                })
        )
        //Render label
        .append(
            $('<label>')
                .attr('for', idStr)
                .html(this.name)
        )
    ;
});

//Static method which requests an (optionally filtered) list of 'type' data
//from the DB and passes a list of Data objects to the provided callback
Data.load = function(type, cb, f) {
    return new Request(type, f?f.constraint():null)
        .pull(function(json) {
            cb(json.map(function(d) {
                return Data[type](d);
            }));
        })
    ;
};
