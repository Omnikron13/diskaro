//require_once(DataList.js)

//UI 'namespace' for jQuery UI functionality
DataList.UI = {
    Buttonset: {
        //Determines which HTML tag the Buttonset container should be
        mainTag: '<fieldset>',
        //Determines which HTML tag the Buttonset header should be
        headerTag: '<legend>',

        //id/name prefix to use if none is specified
        defaultPrefix: '',

        //Function to generate <legend> html str if none is specified
        defaultLegend: function(type) {
            return 'Select ' + type;
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
                .buttonset()
            ;
        }
    }
};
