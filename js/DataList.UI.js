//require_once(DataList.All.js)
//require_once(Data.UI.js)

//UI 'namespace' for jQuery UI functionality
DataList.UI = {
    //Subnamespace for creating unordered list (<ul>) UI elements
    UL: {
        //Function to create actual <ul> element
        render: function(dl) {
            return $('<ul>')
                //Store original DataList object
                .data('datalist', dl)
                //Add generic selection class
                .addClass('dataList')
                //Add specific selection class (e.g. .dataList.Genre)
                .addClass(dl.type)
                //Render Data.UI.LI elements
                .append(
                    dl.map(function(d, i) {
                        return Data.UI.LI.render(d);
                    })
                )
                //Event to add Data obj to the underlying list & UI output
                .on('add', function(ev, d) {
                    //Abort if Data obj already in list
                    if(dl.contains(d)) return;
                    //Add to DataList
                    dl.add(d);
                    //Add to UI output
                    $(this).append(Data.UI.LI.render(d));
                })
                //Event to remove Data obj & corresponding Data.UI.LI element from list
                .on('removeData', function(ev, d) {
                    //Remove obj from underlying list
                    dl.remove(d);
                    //Find & remove corresponding Data.UI.LI element
                    $(this)
                        .find('.dataItem')
                            .each(function() {
                                if($(this).data('data').id == d.id)
                                    $(this).remove();
                            })
                    ;
                })
                //Catch dataUpdate events from Data.UI elements
                .on('dataUpdate', function(ev, d) {
                    //Update stored DataList to reflect change
                    $(this).data('datalist').replace(d.old, d.new);
                })
            ;
        },

        //Function to render an 'Add' button (which must be inserted
        //immediately after the DataList.UI.UL element to work!)
        AddButton: function(text) {
            //Variable to hold DataList.UI.UL ref for closure
            var ul = null;
            //Render button element
            return $('<button>')
                //Add selection class
                .addClass('add')
                .attr('type', 'button')
                //Set button text to given str or default
                .html(text || _('Add'))
                //Catch click events
                .on('click', function() {
                    //Set the DataList.UI.UL ref if it isn't already
                    if(!ul) ul = $(this).prev('.dataList');
                    //Create/Display selection dialogue
                    DataList.UI.Dialogue[ul.data('datalist').type]('add', function(dl) {
                        //Select created DataList.UI.Dialogue element
                        dl
                            //Exclude Data objs already in list
                            .trigger('exclude', ul.data('datalist'))
                            //Catch the selected Data obj
                            .on('save', function(ev, d) {
                                //Tell the DataList.UI.UL to add the Data obj
                                ul.trigger('add', d);
                            })
                        ;
                    });
                })
            ;
        },

        //Utility function to render a user editable DataList.UI.UL element
        Edit: function(dl) {
            //Render main element
            return DataList.UI.UL.render(dl)
                //Open selection dialogue on Data.UI click
                .on('click', '.data', function() {
                    $(this).trigger('updateDialogue');
                })
                //Add context menu (jQuery UI plugin) to Data.UI elements
                .contextmenu({
                    delegate: '.data',
                    //Define menu items
                    menu: [
                        //Edit: Open DataList selection dialogue change this Data item
                        {title: _('Edit'), action: function(ev, ui) {
                            $(ui.target)
                                .trigger('updateDialogue')
                            ;
                        }},
                        //Remove: Remove Data obj from DataList & remove Data.UI.LI element
                        {title: _('Remove'), action: function(ev, ui) {
                            $(ui.target)
                                .trigger('removeData', $(ui.target).data('data'))
                            ;
                        }},
                    ],
                })
                //Render add button
                .add(DataList.UI.UL.AddButton())
            ;
        },
    },

    //Subnamespace for creating jQuery UI Buttonset elements which allow the
    //user to select a single Data object from an arbitrary DataList
    Buttonset: {
        //Determines which HTML tag the Buttonset container should be
        mainTag: '<div>',
        //Determines which HTML tag the Buttonset header should be
        headerTag: '<h1>',

        //id/name prefix to use if none is specified
        defaultPrefix: '',

        //Function to generate <legend> html str if none is specified
        defaultLegend: function(type) {
            return _('Select ' + type);
        },

        //Function to render a Buttonset widget from a DataList object
        render: function(dl, prefix, legend) {
            //Set default values
            prefix = prefix || DataList.UI.Buttonset.defaultPrefix;
            legend = legend || DataList.UI.Buttonset.defaultLegend(dl.type);
            //Render element
            return $(DataList.UI.Buttonset.mainTag)
                .attr('id', prefix + dl.type + 'Buttonset')
                //Add generic selection class
                .addClass('dataList')
                //Add semi-specific selection class
                .addClass('dataButtonset')
                //Add specific selection class (e.g. .dataButtonset.Genre)
                .addClass(dl.type)
                //Render header
                .append(
                    $(DataList.UI.Buttonset.headerTag)
                        .addClass('header')
                        .html(legend)
                )
                //Render search box
                .append(
                    DataList.UI.Buttonset.renderSearch()
                )
                //Render Data.UI.Radio buttons
                .append(
                    dl.map(function(d) {
                        return Data.UI.Radio.render(d, prefix);
                    })
                )
                //Catch button selection
                .on('dataSelect', function(ev, d) {
                    $(this)
                        //Store selected Data obj
                        .data('data', d)
                        //Remove old selected class
                        .find('.selected')
                            .removeClass('selected')
                    ;
                    //Add new selected class
                    $(ev.target).addClass('selected');
                })
                //Event to select/check arbitrary Data.UI.Radio programatically
                .on('setSelected', function(ev, d) {
                    //Select Data.UI.Radio <input> matching given Data id
                    $(this).find('input[value="'+d.id+'"]')
                        //Check it & refresh jQuery UI Button
                        .prop('checked', true)
                        .button('refresh')
                        //Manually trigger change event for handlers
                        .trigger('change')
                    ;
                })
                //Event to remove Data.UI.Radio matching given Data obj
                .on('removeData', function(ev, d) {
                    //Get matching Data.UI element
                    var e = $(this).find(d.getSelectionClass());
                    //If Data.UI(.Radio) isn't checked, remove it
                    if(!e.children('input').prop('checked')) e.remove();
                })
                .buttonset()
            ;
        },

        //Default UI strings for search box
        searchHeaderStr     : _('Search'),
        searchLabelStr      : _('Search'),
        searchPlaceholderStr: _('Search') + '...',

        //Function for rendering a search box to filter out .dataRadio elements by regex
        renderSearch: function() {
            return $('<fieldset>')
                //Add class for generic selection (e.g. .dataButtonset>.search)
                .addClass('search')
                //Render legend/header
                .append(
                    $('<legend>')
                        .addClass('header')
                        .html(DataList.UI.Buttonset.searchHeaderStr)
                )
                //Render field label
                .append(
                    $('<label>')
                        .attr('for', 'search')
                        .html(DataList.UI.Buttonset.searchLabelStr)
                )
                //Render actual search box/field
                .append(
                    $('<input>')
                        .attr('type', 'search')
                        .attr('name', 'search')
                        .attr('placeholder', DataList.UI.Buttonset.searchPlaceholderStr)
                        //Show/Hide DataList Buttons on search string changes
                        .on('input', function() {
                            //Create regex from entered string
                            var regex = new RegExp($(this).val(), 'i');
                            //Find button elements & iterate
                            $(this).parents('.dataButtonset')
                                .find('.dataRadio')
                                    .each(function() {
                                        //Show/Hide based on regex match
                                        if(regex.test($(this).find('.ui-button-text').html()))
                                            $(this).show();
                                        else
                                            $(this).hide();
                                    })
                            ;
                        })
                )
            ;
        },
    },

    //Subnamespace for creating UI dialogue boxes for users to select from a DataList
    Dialogue: {
        //Default main tag type
        mainTag: '<div>',

        //Default UI strings
        saveStr  : _('Save'),
        cancelStr: _('Cancel'),

        //Default jQuery UI position option
        position: {my: 'center', at: 'center', of: window},

        //Main render function for creating actual Dialog UI widget
        render: function(dl, prefix, options) {
            //Set defaults
            var mainTag   = DataList.UI.Dialogue.mainTag;
            var saveStr   = DataList.UI.Dialogue.saveStr;
            var cancelStr = DataList.UI.Dialogue.cancelStr;
            //Check for option overrides
            if(options) {
                if(options.mainTag)   mainTag   = options.mainTag;
                if(options.saveStr)   saveStr   = options.saveStr;
                if(options.cancelStr) cancelStr = options.cancelStr;
            }
            //Render element
            return $(mainTag)
                //Add generic selection class
                .addClass('dataDialogue')
                //Add specific selection class
                .addClass(dl.type.toLowerCase() + 'Dialogue')
                //Set Dialog widget title (displays in top bar)
                .attr('title', _('Select ' + dl.type))
                //Add Buttonset for actual selection
                .append(
                    DataList.UI.Buttonset.render(dl, prefix)
                        //Catch button selection & save Data obj
                        .on('change', function(ev) {
                            $(this).parent().data('data', $(this).data('data'));
                        })
                        //Target all Data Buttons
                        .find('.dataRadio')
                            //Add doubleclick-to-select functionality
                            .on('dblclick', function() {
                                $(this).parents('.dataDialogue')
                                    .trigger('saveAndClose', $(this).data('data'))
                            })
                            .end()
                )
                //Custom (internal) event for shorthand save & close/destroy
                .on('saveAndClose', function(ev, d) {
                    $(this)
                        .trigger('save', d)
                        .dialog('destroy')
                    ;
                })
                //Catch text input (probably from search box) event
                .on('input', function() {
                    //Reset dialogue position to centre
                    $(this).dialog('option', 'position', DataList.UI.Dialogue.position);
                })
                //Catch setSelected events triggered on DataList.UI.Dialogue element
                .on('setSelected', function(ev, d) {
                    //Retrigger the event on the DataList.UI.Buttonset
                    $(this).find('.dataButtonset')
                        .triggerHandler('setSelected', d)
                    ;
                })
                //Event to exclude/remove given Data obj(s) from the selection
                .on('exclude', function(ev, d){
                    //Given a DataList rather than Data obj
                    if(d instanceof DataList) {
                        var that = $(this);
                        //Iterate Data objs & retrigger
                        d.list.forEach(function(d) {
                            that.trigger('exclude', d);
                        });
                        //All retriggered; nothing else to do
                        return;
                    }
                    //Given something other than a Data obj; abort
                    if(!(d instanceof Data)) return;
                    //Given Data obj; find buttonset & retrigger as removeData
                    $(this).find('.dataButtonset')
                        .trigger('removeData', d);
                })
                //Create Dialog widget
                .dialog({
                    width: 'auto',
                    modal: true,
                    resizable: false,
                    draggable: false,
                    position: DataList.UI.Dialogue.position,
                    buttons: [
                        //Cancel: close/destroy without saving selection
                        {text: cancelStr, click: function() {
                            $(this).dialog('destroy');
                        }},
                        //Save: pass out selected Data & close/destroy
                        {text: saveStr, click: function() {
                            $(this).trigger('saveAndClose', $(this).data('data'));
                        }},
                    ],
                })
            ;
        },

        //Utility function to create a DataList.UI.Dialogue of a given
        //complete DataList. Accepts a callback so the calling code can
        //access the created element (e.g. to add handlers, etc.)
        renderAll: function(type, prefix, cb) {
            //Check load full list
            $.when(DataList.All.loaded(type))
                .done(function() {
                    //Create/Display dialogue & pass it to the callback
                    cb(DataList.UI.Dialogue.render(DataList.All[type], prefix));
                });
        },

        //Shorthand functions for calling .renderAll() for each Data type
        Artist: function(prefix, cb) {
            return DataList.UI.Dialogue.renderAll('Artist', prefix, cb);
        },
        Genre: function(prefix, cb) {
            return DataList.UI.Dialogue.renderAll('Genre', prefix, cb);
        },
        Release: function(prefix, cb) {
            return DataList.UI.Dialogue.renderAll('Release', prefix, cb);
        },
        Role: function(prefix, cb) {
            return DataList.UI.Dialogue.renderAll('Role', prefix, cb);
        },
        Label: function(prefix, cb) {
            return DataList.UI.Dialogue.renderAll('Label', prefix, cb);
        },
        Tag: function(prefix, cb) {
            return DataList.UI.Dialogue.renderAll('Tag', prefix, cb);
        },
    },
};
