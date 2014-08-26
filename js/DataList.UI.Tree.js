//require_once(DataList.UI.js)

//Namespace for rendering arbirary DataList obj in a tree structure
DataList.UI.Tree = {
    //Main render function
    render: function(dl) {
        //Store id-indexed Data obj list (array-like-obj)
        var index = dl.getIdIndex();
        return $('<div>')
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
        return $('<div>')
            //Add generic selection class
            .addClass('branch')
            //Add root/leaf selection class(es) if appropriate
            .addClass(d.parentIDs.length == 0?'root':'')
            .addClass(d.childIDs.length == 0?'leaf':'')
            //Render current Data obj
            .append(
                Data.UI.render(d, 'h1')
            )
            //Render child branches (as applicable)
            .append(
                d.childIDs.map(function(cid) {
                    return DataList.UI.Tree.renderBranch(index[cid], index);
                })
            )
        ;
    },
};
