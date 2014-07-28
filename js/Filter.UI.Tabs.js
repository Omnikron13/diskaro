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
    defaultHeader: 'Filters:',

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
                                        .html(f.find('.filterType').html())
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
                                //Pass on filterUpdate events
                                .on('filterUpdate', function(ev, f) {
                                    e.trigger('filterUpdate', f)
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
            //Trigger filterUpdate events when opening/switching/closing tabs
            .on('tabsactivate', function(ev, u) {
                e.trigger('filterUpdate', u.newPanel.find('.filter').data('filter'));
            })
        ;
        //Rendering done
        return e;
    },
};
