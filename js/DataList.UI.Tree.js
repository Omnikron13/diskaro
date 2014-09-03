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
            //Event instructing tree to update branch(es) matching Data obj
            .on('updateBranch', function(ev, d) {
                //Store tree element ref for closures
                var that = $(this);
                $(this)
                    //Check/remove .root flagged branches
                    .trigger('updateRoots')
                    //Update all branches representing the Data obj which changed
                    .find('.branch' + '.id-' + d.id)
                        .each(function() {
                            $(this).trigger('updateBranch')
                        })
                        .end()
                ;
                //Update all branches the changed Data obj lists as parents
                d.parentIDs.forEach(function(pid) {
                    that.find('.branch' + '.id-' + pid)
                        .each(function() {
                            $(this).trigger('addChild', d);
                        });
                });
            })
            //Event to remove .root branches which now have parents
            .on('updateRoots', function() {
                //Select & iterate .root branches
                $(this).find('.branch.root')
                    .each(function(){
                        //If branch now has parents, remove it
                        if($(this).data('data').parentIDs.length != 0)
                            $(this).remove();
                    })
                ;
            })
            //Catch addRoot from parentless branches being removed
            .on('addRoot', function(ev, d) {
                //Abort add if root already exists
                if($(this).find('.branch.root' + '.id-' + d.id).length != 0) return;
                //Add new root branch
                $(this).append(
                    DataList.UI.Tree.renderBranch(d, index)
                );
            })
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
            //Event to perform any UI updates necessary based on stored Data obj
            .on('updateBranch', function() {
                //Store branch element ref for closures
                var that = $(this);
                //Store internal Data obj for easier access
                var d = $(this).data('data');
                //Not-Root specific integrity check
                if(!$(this).hasClass('root')) {
                    //Get parent branch Data obj
                    var p = $(this).parents('.branch').data('data');
                    //Check if this Data obj references parent branch
                    if(!d.parentIDs.some(function(pid) {
                        return pid == p.id;
                    })) {
                        //It doesn't; remove self & abort updating
                        $(this).trigger('removeBranch');
                        return false;
                    }
                }
                //Delegate to specific update events
                $(this)
                    .trigger('updateChildren')
                    .trigger('updateLeafClass')
                ;
                //Stop propagation
                return false;
            })
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
                //If this has no parents tell tree to add it as new root
                if($(this).data('data').parentIDs.length == 0)
                    $(this).trigger('addRoot', d);
                //Store parent branch element
                var p = $(this).parents('.branch').get(0);
                //Remove self
                $(this).remove();
                //Instruct parent branch to recheck leaf status
                $(p).trigger('updateLeafClass');
                //Prevent propagation
                return false;
            })
            //Event to add a new child branch to this branch
            .on('addChild', function(ev, d) {
                //Remove leaf class (if applicable)
                $(this).removeClass('leaf');
                //Get children container element
                var c = $(this).children('.children');
                //Abort add if child branch already exists
                if(c.children('.branch' + '.id-' + d.id).length != 0)
                    return false;
                //Add new branch element from given Data obj
                c.append(
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
                //Recheck leaf class status
                $(this).trigger('updateLeafClass');
                //Prevent propagation
                return false;
            })
            //Event to check/update .leaf class for this branch
            .on('updateLeafClass', function() {
                //Get number of child branches
                var c = $(this).children('.children').children('.branch').length;
                //Add/Remove class as appropriate
                if(c == 0)
                    $(this).addClass('leaf');
                else
                    $(this).removeClass('leaf');
                //Stop propagation
                return false;
            })
        ;
    },

    //Utility function to render DataList.UI.Tree from DataList.All.*
    all: function(type) {
        return DataList.UI.Tree.render(DataList.All[type]);
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
