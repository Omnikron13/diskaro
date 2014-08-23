//require_once(Data.js)

//Namespace for UI output/functionality
Data.UI = {
    //Utility function to render arbitrary tag element from Data obj
    render: function(d, tag) {
        return $('<'+tag+'>')
            //Store original Data obj
            .data('data', d)
            //Add (very) generic selection class
            .addClass('data')
            //Add specific selecion class (e.g. .data.Genre)
            .addClass(d.type)
            //Render output text/html
            .html(d.name)
        ;
    },

    //Subnamespace for ul/ol item (<li>) output
    LI: {
        //Function to render <li> (jQuery) element from Data obj
        render: function(d) {
            //Create base Data.UI element
            return Data.UI.render(d, 'li')
                //Add more specific selection class
                .addClass('dataItem')
            ;
        },
    },

    //Subnamespace for creating radio button UI elements from Data obj
    Radio: {
        //Function to render <span> holding button/label pair
        render: function(d, prefix) {
            //Construct id/for attr string
            var idStr = prefix + d.type + 'Radio-' + d.id;
            return $('<span>')
                //Store original Data obj
                .data('data', d)
                //Add generic selection class
                .addClass('dataRadio')
                //Add specific selecion class (e.g. .dataRadio.Genre)
                .addClass(d.type)
                //Render control/button
                .append(
                    $('<input>')
                        //jQuery Buttonset requires id
                        .attr('id', idStr)
                        //Render as radio button
                        .attr('type', 'radio')
                        //Unique group name
                        .attr('name', prefix + d.type)
                        //Probably never needed, but store Data uid
                        .val(d.id)
                )
                //Render label
                .append(
                    $('<label>')
                        .attr('for', idStr)
                        .html(d.name)
                )
                //Catch change events from actual input/radio element
                .on('change', function() {
                    //Retrigger custom event on main element (passing selected Data obj)
                    $(this).trigger('dataSelect', $(this).data('data'));
                })
            ;
        },
    },
},
