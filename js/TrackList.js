//require_once(CrockfordSugar.js)
//require_once(Player.js)
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
    //Shuffle flag
    this.shuffle = false;
};

//Pull a list of tracks from the DB with optional filter
TrackList.method('load', function(f) {
    var that = this;
    var rq = {
        class: 'Track',
        constraint: typeof f=='undefined'?
            {type:null}:
            f.constraint()
    };
    return $.getJSON('getjson.php', rq, function(json) {
        that.list = json.map(function(t) {
            return new Track(t);
        });
    });
});

//Renders a <table> element of the track list
TrackList.method('renderTable', function() {
    var that = this;
    return $('<table>')
        .attr('id', 'trackList')
        //Render headings row
        .append($('<tr>')
            .attr('id', 'trackListHeadings')
            .append($.map(this.columns, function(c, i) {
                return c.renderTH()
                    .on('click', function() {
                        that.headingClick(i);
                    })
                    .addClass(i === that.sortColumn?(that.sortAsc?'sortAsc':'sortDesc'):'')
                ;
            }))
        )
        //Render track rows
        .append($.map(this.list, function(t, i) {
            return t.renderTR(that.columns)
                .on('dblclick', function() {
                    that.trackDblClick(i);
                })
                .addClass(t.id === that.active?'trackActive':'')
            ;
        }))
    ;
});

//Method to process track double clicks
TrackList.method('trackDblClick', function(index) {
    this.play(index);
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
    return this;
});

//Method to set the active track index
TrackList.method('setActive', function(index) {
    this.active = this.list[index].id;
    $('.trackActive').removeClass('trackActive');
    $('.trackItem:nth-child('+(index+2)+')').addClass('trackActive');
    return this;
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
    Player.play(this.list[index]);
    return this;
});

//Method to play the next track in the list
TrackList.method('playNext', function() {
    if(this.shuffle) return this.playRandom();
    if(this.active === null) return this.play(0);
    return this.play((this.trackIndex(this.active)+1)%this.list.length);
});

//Method to play a random track from .list (excluding .active)
TrackList.method('playRandom', function() {
    var i = Math.floor(Math.random()*this.list.length);
    if(i === this.trackIndex(this.active)) i = (i+1)%this.list.length;
    return this.play(i);
});

//Method to update the browser output
TrackList.method('update', function() {
    $('#trackList').replaceWith(this.renderTable());
    return this;
});

//Static member defining a default set of TrackColumns to render
TrackList.defaultColumns = [
    new TrackColumn('#', TrackColumn.renderNumber, TrackColumn.sortNumber),
    new TrackColumn('Title', TrackColumn.renderTitle, TrackColumn.sortTitle),
    new TrackColumn('Artists', TrackColumn.renderRole('Artist'), TrackColumn.sortRole('Artist')),
    new TrackColumn('Release', TrackColumn.renderRelease, TrackColumn.sortRelease),
    new TrackColumn('Genres', TrackColumn.renderGenres, TrackColumn.sortGenres)
];
