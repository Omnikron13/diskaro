//require_once(Data.js)
//require_once(DataList.All.js)

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
            //Add (very specific) id selection class (e.g. .data.Genre.id-1)
            .addClass('id-' + d.id)
            //Render output text/html
            .html(d.name)
            //Event to update/refresh UI output from stored Data obj
            .on('updateOutput', function() {
                //If this is a basic Data.UI element update HTML
                if($(this).children().length == 0)
                    $(this).html($(this).data('data').name);
            })
            //Event to update internal Data obj & possibly UI output
            .on('updateData', function(ev, d) {
                //Get current/old Data obj
                var old = $(this).data('data');
                //Abort update if new/old type don't match
                if(old.type != d.type) return;
                $(this)
                    //Update id selection class
                    .removeClass('id-' + old.id)
                    .addClass('id-' + d.id)
                    //Store new Data obj
                    .data('data', d)
                    //Update UI output
                    .trigger('updateOutput')
                    //Trigger event to alert containers (e.g. DataList.UI)
                    .trigger('dataUpdate', {old:old, new:d})
                ;
            })
            //Event to open a dialogue allowing the user to change this Data obj
            .on('updateDialogue', function() {
                //Store Data.UI element & Data obj for closures
                var that = $(this);
                var data = that.data('data');
                $.when(DataList.All.loaded(data.type))
                    .done(function() {
                        //Create/Display selection dialogue
                        DataList.UI.Dialogue.render(DataList.All[data.type], 'edit')
                            .trigger('setSelected', data)
                            //Catch selected Data obj on save
                            .on('save', function(ev, d) {
                                that.trigger('updateData', d);
                            })
                        ;
                    });
            })
        ;
    },

    //Shorthand for rendering Data.UI <span> element
    Span: function(d) {
        return Data.UI.render(d, 'span');
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
            return Data.UI.render(d, 'span')
                //Clear default .html() (from Data.UI.render())
                .empty()
                //Add generic selection class
                .addClass('dataRadio')
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
                //Catch updateOutput events
                .on('updateOutput', function() {
                    //Update button-text/label
                    $(this).find('.ui-button-text')
                        .html($(this).data('data').name);
                })
            ;
        },
    },
};

/*-------------------------*
 | Data class enhancements |
 *-------------------------*/
//Add method to generate Data.UI CSS class str (e.g. .data.Genre.id-1)
Data.method('getSelectionClass', function() {
    return '.data'
        + '.' + this.type
        + '.id-' + this.id
    ;
});
