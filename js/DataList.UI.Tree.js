//require_once(DataList.UI.js)

//Namespace for rendering arbirary DataList obj in a tree structure
DataList.UI.Tree = {
    //Main render function
    render: function(dl) {
        //Store id-indexed Data obj list (array-like-obj)
        var index = dl.getIdIndex();
        return $('<ul>')
            //Store original DataList obj
            .data('datalist', dl)
            //Add generic selection class
            .addClass('dataList')
            //Add semi-specific selection class (e.g. .dataList.tree)
            .addClass('tree')
            //Add specific selection class (e.g. .dataList.tree.Genre)
            .addClass(dl.type)
            //Render branches
            .append(
                dl.getRoots().map(function(d) {
                    return DataList.UI.Tree.renderBranch(d, index);
                })
            )
        ;
    },

    //Function to render an individual branch from Data obj & id-index
    renderBranch: function(d, index) {
        return $('<li>')
            //Store main Data obj for easier access
            .data('data', d)
            //Add generic selection class
            .addClass('branch')
            //Add Data id selection class (e.g. .branch.id-1)
            .addClass('id-' + d.id)
            //Add root/leaf selection class(es) if appropriate
            .addClass(d.parentIDs.length == 0?'root':'')
            .addClass(d.childIDs.length == 0?'leaf':'')
            //Render current Data obj
            .append(
                Data.UI.render(d, 'h1')
            )
            //Render children container
            .append(
                $('<ul>')
                    //Add selection class
                    .addClass('children')
                    //Render child branches (as applicable)
                    .append(
                        d.childIDs.map(function(cid) {
                            return DataList.UI.Tree.renderBranch(index[cid], index);
                        })
                    )
            )
            //Event to add new child branches & remove orphaned ones
            .on('updateChildren', function() {
                //Store branch element ref for closures
                var that = $(this);
                //Get Data obj (save on method calls)
                var d = $(this).data('data');
                //Get Data obj .id of each child branch element
                var cids = $(this).children('.children').children('.branch')
                    .map(function(i, e) {
                        return $(e).data('data').id;
                    })
                    .get()
                ;
                //Remove orphaned children
                cids.diff(d.childIDs).forEach(function(id) {
                    that.trigger('removeChild', index[id]);
                });
                //Add missing children
                d.childIDs.diff(cids).forEach(function(id) {
                    that.trigger('addChild', index[id]);
                });
                //Stop propagation
                return false;
            })
            //Event to remove this branch
            .on('removeBranch', function() {
                //Remove self
                $(this).remove();
                //Prevent propagation
                return false;
            })
            //Event to add a new child branch to this branch
            .on('addChild', function(ev, d) {
                //Select children container element
                $(this).children('.children')
                    //Add new branch element from given Data obj
                    .append(
                        DataList.UI.Tree.renderBranch(d, index)
                    );
                //Prevent propagation
                return false;
            })
            //Event to remove a given child branch from this branch
            .on('removeChild', function(ev, d) {
                //Select children container element
                $(this).children('.children')
                    //Select specific child branch by id
                    .children('.branch' + '.id-' + d.id)
                        //Instruct it to remove itself
                        .trigger('removeBranch')
                ;
                //Prevent propagation
                return false;
            })
            //Event to check/update .leaf class for this branch
            .on('updateLeafClass', function() {
                //Get number of child branches
                var c = $(this).children('.children').children('.branch').length;
                //Add/Remove class as appropriate
                if($(this).hasClass('leaf') && c != 0)
                    $(this).removeClass('leaf');
                if(!$(this).hasClass('leaf') && c == 0)
                    $(this).addClass('leaf');
                //Stop propagation
                return false;
            })
        ;
    },

    //Utility function to render DataList.UI.Tree from DataList.All.*
    all: function(type) {
        //Create placeholder
        var e = $('<p>')
            .addClass('placeholder')
            .html(_(type + ' list loading') + '...')
        ;
        //Defer main rendering til DataList.All is ready
        $.when(DataList.All.loaded(type))
            .done(function() {
                e.replaceWith(
                    DataList.UI.Tree.render(DataList.All[type])
                );
            });
        //Return placeholder
        return e;
    },

    //Shorthands for creating DataList.All.* trees
    Artist: function() {
        return DataList.UI.Tree.all('Artist');
    },
    Genre: function() {
        return DataList.UI.Tree.all('Genre');
    },
    Label: function() {
        return DataList.UI.Tree.all('Label');
    },
    Release: function() {
        return DataList.UI.Tree.all('Release');
    },
    Role: function() {
        return DataList.UI.Tree.all('Role');
    },
    Tag: function() {
        return DataList.UI.Tree.all('Tag');
    },
};
