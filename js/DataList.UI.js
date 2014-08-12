//require_once(DataList.js)

//UI 'namespace' for jQuery UI functionality
DataList.UI = {
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
                .addClass('dataButtonset')
                .addClass(dl.type.toLowerCase() + 'Buttonset')
                .append(
                    $(DataList.UI.Buttonset.headerTag)
                        .addClass('header')
                        .html(legend)
                )
                .append(
                    $.map(dl.list, function(d, i) {
                        return d.renderRadio(prefix)
                            .on('click', function() {
                                dl.processCallbacks('itemClick', i);
                            })
                            .on('change', function() {
                                dl.processCallbacks('itemChange', i);
                            })
                        ;
                    })
                )
                //Catch button selection & store selected Data obj
                .on('change', function(ev) {
                    $(this).data('data', $(ev.target).data('data'));
                })
                .buttonset()
            ;
        }
    },

    //Subnamespace for creating UI dialogue boxes for users to select from a DataList
    Dialogue: {
        //Default main tag type
        mainTag: '<div>',

        //Default UI strings
        saveStr  : _('Save'),
        cancelStr: _('Cancel'),

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
                //Create Dialog widget
                .dialog({
                    width: 'auto',
                    modal: true,
                    resizable: false,
                    draggable: false,
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
    },
};
