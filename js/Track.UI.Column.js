//require_once(Track.UI.js)
//require_once(Track.Sort.js)

//Constructor for Track table column objects (for rendering <th>/<td> cells)
Track.UI.Column = function(name, head, sort, renderContent, isNull) {
    //Store column heading (<th>) content str/html
    this.heading = head;
    //Store .sort() callback
    this.sort = sort;
    //Store function to render <td> cell content/html
    this.renderContent = renderContent;
    //Store function to check if cell is null/empty/unknown/etc.
    this.isNull = isNull;
    //Store this for closures
    var that = this;
    //Add function to render <th> heading element
    this.renderHeading = function() {
        return $('<th>')
            //Store ref back to 'parent' Track.UI.Column
            .data('column', that)
            //Add generic selection class
            .addClass('heading')
            //Add specific selection class (e.g. .heading.genres)
            .addClass(name)
            //Render given heading str/html
            .html(head)
        ;
    };
    //Add function to render <td> cell element from Track obj
    this.renderCell = function(t) {
        return $('<td>')
            //Save Track obj (for updates etc.)
            .data('track', t)
            //Add generic selection class
            .addClass('cell')
            //Add specific selection class (e.g. .cell.genres)
            .addClass(name)
            //Event to update UI output from stored Track obj
            .on('update', function() {
                //Get stored Track obj (save method calls)
                var t = $(this).data('track');
                //Update cell content str/html
                $(this).html(renderContent(t));
                //Update null/empty/unknown flag class
                if(that.isNull(t))
                    $(this).addClass('null');
                else
                    $(this).removeClass('null');
            })
            //Trigger update immediately to render initial output
            .trigger('update')
        ;
    };
};

//Utility method to create arbitrary DataList based columns
Track.UI.Column.DataList = function(name, head, getDL) {
    return new Track.UI.Column(
        //Internal column/cell name
        name,
        //Column heading (<th>) UI str
        head,
        //Track .sort() callback
        Track.Sort.DataList(getDL),
        //Function to render .html() content
        function(t) {
            return DataList.UI.UL.render(getDL(t));
        },
        //Function to check if cell is null/empty
        function(t) {
            return getDL(t).list.length == 0;
        }
    );
};

//Utility method to create arbitrary Role columns (e.g. 'Artist')
Track.UI.Column.Role = function(r, name, head) {
    return Track.UI.Column.DataList(
        name,
        head,
        function(t) {
            return t.getArtistsByRole(r);
        }
    );
};

/*--------------------*
 | Predefined Columns \
 *--------------------*/
//Basic track number (.trackNumber) Column
Track.UI.Column.Number = new Track.UI.Column(
    //Internal column/cell name
    'trackNumber',
    //Column heading (<th>) UI str
    _('#'),
    //Track .sort() callback
    Track.Sort.Number,
    //Function to render .html() content
    function(t) {
        return t.trackNumber || '';
    },
    //Function to check if cell is null/empty
    function(t) {
        return !t.trackNumber;
    }
);

//Basic track title (.name) Column
Track.UI.Column.Title = new Track.UI.Column(
    //Internal column/cell name
    'title',
    //Column heading (<th>) UI str
    _('Title'),
    //Track .sort() callback
    Track.Sort.Title,
    //Function to render .html() content
    function(t) {
        return t.name || _('Unknown');
    },
    //Function to check if cell is null/empty
    function(t) {
        return !t.name;
    }
);

//Basic Release (.release) Column
Track.UI.Column.Release = new Track.UI.Column(
    //Internal column/cell name
    'release',
    //Column heading (<th>) UI str
    _('Release'),
    //Track .sort() callback
    Track.Sort.Release,
    //Function to render .html() content
    function(t) {
        return t.release ? t.release.name : _('Unknown');
    },
    //Function to check if cell is null/empty
    function(t) {
        return !t.release;
    }
);

//Basic Release Label (.release.label) Column
Track.UI.Column.Label = new Track.UI.Column(
    //Internal column/cell name
    'label',
    //Column heading (<th>) UI str
    _('Label'),
    //Track .sort() callback
    Track.Sort.Label,
    //Function to render .html() content
    function(t) {
        return t.release && t.release.label ? t.release.label.name : _('Unknown');
    },
    //Function to check if cell is null/empty
    function(t) {
        return !(t.release && t.release.label);
    }
);

//Basic track Genres (.genres) Column
Track.UI.Column.Genres = Track.UI.Column.DataList(
    'genres',
    _('Genres'),
    function(t) {
        return t.genres;
    }
);

//Basic track Tags (.tags) Column
Track.UI.Column.Tags = Track.UI.Column.DataList(
    'tags',
    _('Tags'),
    function(t) {
        return t.tags;
    }
);

//Basic 'primary artist' (Role: 'Artist') Column
Track.UI.Column.Role.Artists = Track.UI.Column.Role(
    'Artist',
    'artists',
    _('Artists')
);

/*-----------------------------*
 | Predefined 'all' Column set |
 *-----------------------------*/
Track.UI.Column.All = [
    Track.UI.Column.Number,
    Track.UI.Column.Title,
    Track.UI.Column.Role.Artists,
    Track.UI.Column.Release,
    Track.UI.Column.Genres,
    Track.UI.Column.Tags,
];
