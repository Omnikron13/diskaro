//require_once(CrockfordSugar.js)
//require_once(Track.js)
//require_once(TrackColumn.js)

function TrackList(json, columns) {
    this.list = json.map(function(t) {
        return new Track(t);
    });
    this.columns = columns || TrackList.defaultColumns;
    this.active = null; //Index of currently active/playing Track
    this.lastSort = null; //Stores last sort callback
};

//Renders a <table> element of the track list
TrackList.method('renderTable', function() {
    var that = this;
    var table = document.createElement('table');
    table.setAttribute('id', 'trackList');
    //Render headings
    var tr = table.appendChild(document.createElement('tr'));
    tr.setAttribute('id', 'trackListHeadings');
    this.columns.forEach(function(c, i) {
        var th = tr.appendChild(c.renderTH());
        th.onclick = function() {
            that.headingClick(i);
        };
    });
    //Render track rows
    this.list.forEach(function(t, i) {
        var tr = table.appendChild(t.renderTR(that.columns));
        tr.ondblclick = function() {
            that.trackDblClick(i)
        };
    });
    return table;
});

//Method to process track double clicks
TrackList.method('trackDblClick', function(index) {
    this.setActive(index);
    this.play();
    $("#output").html(this.list[index].name);
});

//Method to process heading (<th>) clicks
TrackList.method('headingClick', function(i) {
    if(this.lastSort == this.columns[i].sort)
        this.list.reverse();
    else
        this.sort(this.columns[i].sort);
    this.update();
});

//Method to sort the track list & store the sort callback (so repeated sorts
//attempts can be either ignored or replaced with a .reverse() call)
TrackList.method('sort', function(sort) {
    this.list.sort(sort);
    this.lastSort = sort;
});

//Method to set the active track index
TrackList.method('setActive', function(index) {
    if(this.active !== null)
        $('.trackItem:nth-child('+(this.active+2)+')').removeClass('trackActive');
    $('.trackItem:nth-child('+(index+2)+')').addClass('trackActive');
    this.active = index;
});

//Method to play given track
TrackList.method('play', function(index) {
    if(typeof(index)==='undefined') index = this.active;
    $('#audioPlayer>source').attr('src', this.list[index].path);
    $('#audioPlayer').trigger('load');
    $('#audioPlayer').trigger('play');
});

//Method to update the browser output
TrackList.method('update', function() {
    $('#trackList').replaceWith(this.renderTable());
});

//Static member defining a default set of TrackColumns to render
TrackList.defaultColumns = [
    new TrackColumn('#', TrackColumn.renderNumber, TrackColumn.sortNumber),
    new TrackColumn('Title', TrackColumn.renderTitle, TrackColumn.sortTitle),
    new TrackColumn('Artists', TrackColumn.renderRole('Artist'), TrackColumn.sortRole('Artist')),
    new TrackColumn('Release', TrackColumn.renderRelease, TrackColumn.sortRelease),
    new TrackColumn('Genres', TrackColumn.renderGenres, TrackColumn.sortGenres)
];
