//require_once(Track.js)

//UI 'namespace' for jQuery UI functionality
Track.UI = {
    //Subnamespace for context menu widget (jQuery UI plugin)
    Context: {
        //Array of items in the menu
        items: [
            //Play: start Track playing
            {title: _('Play'), action: function(ev, ui) {
                ui.target.parents('.trackItem').trigger('play');
            }},
            //Edit: open dialogue box where the user can edit Track data
            {title: _('Edit'), action: function(ev, ui) {
                var tr = ui.target.parents('.trackItem');
                Track.UI.Edit.renderDialogue(tr.data('track'))
                    .on('save', function(ev, _t) {
                        Request.Update('Track', _t)
                            .process(function(response) {
                                //Abort UI update if request failed
                                if(!response.success) return;
                                //Update UI
                                tr.triggerHandler('updateTrack', new Track(response.data));
                            })
                        ;
                    })
                ;
            }},
        ],

        //Function to initialise the menu on given selector (or body)
        init: function(selector) {
            $(selector || 'body')
                .contextmenu({
                    delegate: '.trackItem',
                    menu: Track.UI.Context.items,
                })
            ;
        },
    },
};
