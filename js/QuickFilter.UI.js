//require_once(QuickFilter.js)

//UI 'namespace' for jQuery UI functionality
QuickFilter.UI = {
    //Subnamespace for Tabs widget functionality
    Tabs: {
        //Determines which HTML tag the Tabs container should be
        mainTag: '<section>',

        //Function to render Tabs widget from an array of QuickFilters
        render: function(qfs) {
            return $(QuickFilter.UI.Tabs.mainTag)
                .addClass('quickFilterTabs')
                .append(
                    $('<h1>')
                        .html('QuickFilter:')
                )
                .append(
                    $('<ul>')
                        .append(
                            qfs.map(function(qf) {
                                return $('<li>')
                                    .append(
                                        $('<a>')
                                            .attr('href', '#'+qf.attr('id'))
                                            .html(qf.find('.quickFilterName').html())
                                    )
                                ;
                            })
                        )
                )
                .append(qfs)
                .tabs({
                    collapsible: true
                })
            ;
        }
    }
};
