//require_once(Data.js)

//Namespace for UI output/functionality
Data.UI = {
    //Subnamespace for ul/ol item (<li>) output
    LI: {
        //Function to render <li> (jQuery) element from Data obj
        render: function(d) {
            return $('<li>')
                //Store original Data obj
                .data('data', d)
                //Add generic selection class
                .addClass('dataItem')
                //Add specific selecion class (e.g. .dataItem.Genre)
                .addClass(d.type)
                //Render output text/html
                .html(d.name)
            ;
        },
    },
},
