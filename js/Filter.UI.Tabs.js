//require_once(Filter.UI.js)

//Namespace for creating jQuery UI Tabs of Filter.UI elements
Filter.UI.Tabs = {
    //Tag types used for the main container & each tab container
    mainTag:   '<div>',
    headerTag: '<h1>',
    tabTag:    '<section>',

    //Used to construct tab id strings (along with a prefix & index)
    tabID: 'filterTabs-',

    //Prefix used to construct tab ids if none is specified
    defaultPrefix: '',

    //String used for the main header if none is specified
    defaultHeader: _('Filters') + ':',

    //Function to create Tabs widget from array of Filter.UI elements
    render: function(filters, prefix, header) {
        //Set default values
        prefix = prefix || Filter.UI.Tabs.defaultPrefix;
        header = header || Filter.UI.Tabs.defaultHeader;

        //Construct tab id string
        var tabID = prefix + Filter.UI.Tabs.tabID;

        //Create main container element
        var e = $(Filter.UI.Tabs.mainTag)
            .addClass('filterTabs')
            //Create header
            .append(
                $(Filter.UI.Tabs.headerTag)
                    .html(header)
            )
            //Create Tabs list
            .append(
                $('<ul>')
                    .append(
                        filters.map(function(f, i) {
                            return $('<li>')
                                .append(
                                    $('<a>')
                                        .attr('href', '#' + tabID + i)
                                        .html(_(f.data('type')))
                                )
                            ;
                        })
                    )
            )
            //Create Tabs content
            .append(
                filters.map(function(f, i) {
                    return $(Filter.UI.Tabs.tabTag)
                        .attr('id', tabID + i)
                        .addClass('filterTab')
                        .append(f)
                    ;
                })
            )
            //Tabify
            .tabs({
                collapsible: true,
                active: false,
            })
            //Catch filter state changes from tabbed Filter.UI
            .on('filterUpdate', function(ev, f) {
                //Store new Filter in main .filterTabs element
                $(this).data('filter', f);
            })
            //Catch tab open/close/switch events & retrigger specific events
            .on('tabsactivate', function(ev, u) {
                //Tab was closed...
                if(Object.keys(u.newPanel).length == 0) {
                    $(this).trigger('tabClose', u);
                    return;
                }
                //Tab was switched...
                if(Object.keys(u.oldPanel).length != 0) {
                    $(this).trigger('tabSwitch', u);
                }
                //Tab was opened/switched...
                $(this).trigger('tabOpen', u);
            })
            //Update stored Filter, type str & human-readable str and trigger
            //change event on open/close/switch tab
            .on('tabsactivate', function(ev, u) {
                //Tab was closed...
                if(Object.keys(u.newPanel).length == 0)
                    e.data('filter', null);
                //Tab was opened/switched
                else {
                    var f = u.newPanel.find('.filter');
                    //...but there is no Filter stored
                    if(!f.data('filter'))
                        e.data('filter', null);
                    //...and there is a Filter stored
                    else
                        e.data('filter', f.data('filter'));
                }
                //Retrigger as a filterUpdate event
                e.trigger('filterUpdate', e.data('filter'));
            })
        ;
        //Rendering done
        return e;
    },
};
