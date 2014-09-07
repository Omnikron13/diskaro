//require_once(Data.UI.Edit.js)
//require_once(DataList.UI.Tree.js)

//Namespace for functionality to add/edit/remove Data entries from the DB
Data.UI.Manage = {
    //Funtion to render UI element allowing the user to edit Data entries
    render: function(type, opt) {
        //Set default render style (Release can't render as a tree)
        var style = type == 'Release' ? 'List' : 'Tree';
        //Override defaults as appropriate
        if(opt) {
            if(opt.style) style = opt.style;
        }
        //Get DataList obj from type str
        var dl = DataList.All[type];
        //Render container element
        return $('<div>')
            //Add generic selection class
            .addClass('manage')
            //Add specific selection class (e.g. .manage.Genre)
            .addClass(type)
            //Render element of specified style
            .append(
                Data.UI.Manage.Style[style](dl)
            )
            //Event to simplify triggering 'add' on the DataList.UI
            .on('addData', function(ev, d) {
                $(this).children('.dataList').trigger('add', d);
            })
            //Catch Data.UI click events & open edit dialogue
            .on('click', '.data', function(ev) {
                //Save ref to DataList.UI element for closure(s)
                var dlui = $(ev.delegateTarget).children('.dataList');
                //Save ref to (master) Data obj for closure(s)
                var d = $(this).triggerHandler('getData');
                //Render Data edit dialogue on (cloned) Data obj
                Data.UI.Edit.render(d.clone())
                    //Catch (possibly) updated Data obj
                    .on('save', function(ev, _d) {
                        //Send update request to server
                        Request.Update(type, _d)
                            .process(function(response) {
                                //Alert/abort on request failure
                                if(!response.success) {
                                    window.alert(response.message);
                                    return;
                                }
                                //Update (master) Data obj
                                d.update(Data[type](response.data));
                                //Instruct all Data.UI of this type/id to update
                                $(d.getSelectionClass())
                                    .trigger('updateOutput')
                                ;
                                //Instruct DataList.UI to peform any necessary updates
                                dlui.trigger('updateData', d);
                            })
                    })
                ;
            })
        ;
    },

    //Namespace for predefined render styles
    Style: {
        //Style to render as a flat list
        List: function(dl) {
            return DataList.UI.UL.render(dl)
            ;
        },

        //Style to render as a tree structure
        Tree: function(dl) {
            return DataList.UI.Tree[dl.type]()
            ;
        },
    },
};
