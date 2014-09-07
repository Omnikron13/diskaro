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
            //Render comments as mouseover text
            .attr('title', d.comments)
            //Getter event to return stored Data obj (with .triggerHandler())
            .on('getData', function() {
                if($(this).hasClass('id-null')) return null;
                return $(this).data('data');
            })
            //Event to update/refresh UI output from stored Data obj
            .on('updateOutput', function() {
                //If this is a basic Data.UI element update HTML
                if($(this).children().length == 0)
                    $(this).html($(this).data('data').name);
                //Update mouseover text (.comments)
                $(this).attr('title', d.comments);
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
            .on('updateDialogue', function(ev, exclude) {
                //Store Data.UI element & Data obj for closures
                var that = $(this);
                var data = that.data('data');
                $.when(DataList.All.loaded(data.type))
                    .done(function() {
                        //Create/Display selection dialogue
                        DataList.UI.Dialogue.render(DataList.All[data.type], 'edit')
                            //Set initially selected Data (if any)
                            .trigger('setSelected', data)
                            //Pass on exclude Data/DataList obj
                            .trigger('exclude', exclude)
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

    //Function to render a Data.UI.Span that the user can change
    Select: function(type, d, options) {
        //Init defaults
        var allowNull = true;
        var nullName = null;
        //Override defaults as appropriate
        if(options) {
            if(options.allowNull === false) allowNull = false;
            if(options.nullName) nullName = options.nullName;
        }
        //Render Data.UI element
        return Data.UI.Span(d || Data.Null(type, nullName))
            //Add selection class (e.g. .data.select)
            .addClass('select')
            //Open dialogue to choose new Data obj on click
            .on('click', function() {
                $(this).trigger('updateDialogue');
            })
            //Add context (right click) menu (jQuery UI plugin)
            .contextmenu({
                //Define menu items
                menu: [
                    //Edit: Open DataList selection dialogue change this Data item
                    {title: _('Edit'), cmd: 'edit', action: function(ev, ui) {
                        $(ui.target)
                            .trigger('updateDialogue')
                        ;
                    }},
                    //Remove: Null Data obj & Data.UI element
                    {title: _('Remove'), cmd: 'remove', action: function(ev, ui) {
                        $(ui.target)
                            .trigger('updateData', Data.Null(type, nullName))
                        ;
                    }},
                ],
            })
            //Show/hide the 'Remove' option according to if nulls are allowed
            .contextmenu('showEntry', 'remove', allowNull)
        ;
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
