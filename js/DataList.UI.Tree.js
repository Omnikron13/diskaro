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
