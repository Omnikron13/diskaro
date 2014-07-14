//require_once(CrockfordSugar.js)
//require_once(Track.js)
//require_once(TrackColumn.js)

function TrackList(json, columns) {
    this.list = json.map(function(t) {
        return new Track(t);
    });
    this.columns = columns || TrackList.defaultColumns;
    this.active = null; //id of active/playing track
    //Currently sorted column & sort order flag
    this.sortColumn = null;
    this.sortAsc = true;
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
        if(i === that.sortColumn)
            th.setAttribute('class', that.sortAsc?'sortAsc':'sortDesc');
    });
    //Render track rows
    this.list.forEach(function(t, i) {
        var tr = table.appendChild(t.renderTR(that.columns));
        tr.ondblclick = function() {
            that.trackDblClick(i)
        };
        if(t.id === that.active) $(tr).addClass('trackActive');
    });
    return table;
});

//Method to process track double clicks
TrackList.method('trackDblClick', function(index) {
    this.play(index);
    $("#output").html(this.list[index].name);
});

//Method to process heading (<th>) clicks
TrackList.method('headingClick', function(i) {
    if(this.sortColumn == i) {
        this.list.reverse();
        this.sortAsc = !this.sortAsc;
    } else {
        this.sort(this.columns[i].sort);
        this.sortColumn = i;
        this.sortAsc = true;
    }
    this.update();
});

//Method to sort the tracklist - just defers to list.sort()
TrackList.method('sort', function(sort) {
    this.list.sort(sort);
});

//Method to set the active track index
TrackList.method('setActive', function(index) {
    this.active = this.list[index].id;
    $('.trackActive').removeClass('trackActive');
    $('.trackItem:nth-child('+(index+2)+')').addClass('trackActive');
});

//Method to find a .list index from a track id.
//Returns null if the id can't be found.
TrackList.method('trackIndex', function() {
    var that = this;
    var index = null;
    this.list.some(function(t, i) {
        if(t.id === that.active) {
            index = i;
            return true;
        }
    });
    return index;
});

//Method to play given track
TrackList.method('play', function(index) {
    this.setActive(index);
    $('#audioPlayer>source').attr('src', this.list[index].path);
    $('#audioPlayer').trigger('load');
    $('#audioPlayer').trigger('play');
});

//Method to play the next track in the list
TrackList.method('playNext', function() {
    this.play((this.trackIndex(this.active)+1)%this.list.length);
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
