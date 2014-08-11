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
                        .append(
                            f
                                //Update stored Filter, type str & human-readable str on Filter.UI change
                                .on('change', function() {
                                    e.data({
                                        filter: f.data('filter'),
                                        filterType: f.data('type'),
                                        filterStr: f.data('filterStr'),
                                    });
                                })
                        )
                    ;
                })
            )
            //Tabify
            .tabs({
                collapsible: true,
                active: false,
            })
            //Update stored Filter, type str & human-readable str and trigger
            //change event on open/close/switch tab
            .on('tabsactivate', function(ev, u) {
                //Tab was closed...
                if(Object.keys(u.newPanel).length == 0)
                    e.data({
                        filter: null,
                        filterType: null,
                    });
                //Tab was opened/switched
                else {
                    var f = u.newPanel.find('.filter');
                    //...but there is no Filter stored
                    if(!f.data('filter'))
                        e.data({
                            filter: null,
                            filterType: null,
                        });
                    //...and there is a Filter stored
                    else
                        e.data({
                            filter: f.data('filter'),
                            filterType: f.data('type'),
                            filterStr: f.data('filterStr'),
                        });
                }
                //Retrigger as a change event
                e.trigger('change');
            })
        ;
        //Rendering done
        return e;
    },
};
