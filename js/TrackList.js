//require_once(CrockfordSugar.js)
//require_once(Track.js)
//require_once(TrackColumn.js)

function TrackList(json, columns) {
    this.list = json.map(function(t) {
        return new Track(t);
    });
    this.columns = columns || TrackList.defaultColumns;
    this.active = null; //Index of currently active/playing Track
};

//Renders a <table> element of the track list
TrackList.method('renderTable', function() {
    var that = this;
    var table = document.createElement('table');
    table.setAttribute('id', 'trackList');
    //Render headings
    var tr = table.appendChild(document.createElement('tr'));
    tr.setAttribute('id', 'trackListHeadings');
    this.columns.forEach(function(c) {
        tr.appendChild(c.renderTH());
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

//Method to create a HTML element
TrackList.method('getElement', function() {
    var tl = this;
    var element = document.createElement('table');
    element.setAttribute('id', 'trackList');
    //Add table headers
    var head = document.createElement('tr');
    head.setAttribute('id', 'trackListHeadings');
    head.appendChild(document.createElement('th')).innerHTML = 'Track #';
    head.appendChild(document.createElement('th')).innerHTML = 'Title';
    head.appendChild(document.createElement('th')).innerHTML = 'Artist';
    head.appendChild(document.createElement('th')).innerHTML = 'Release';
    head.appendChild(document.createElement('th')).innerHTML = 'Genre';
    element.appendChild(head);
    //Add track rows
    this.list.forEach(function(t, index) {
        var trackElement = t.getElement();
        trackElement.ondblclick = function() {
            tl.trackDblClick(index);
        };
        element.appendChild(trackElement);
    });
    return element;
});

//Method to process track double clicks
TrackList.method('trackDblClick', function(index) {
    this.setActive(index);
    this.play();
    $("#output").html(this.list[index].name);
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
    $('#audioPlayer>source').attr('src', '0'+this.list[index].id+'.ogg');
    $('#audioPlayer').trigger('load');
    $('#audioPlayer').trigger('play');
});

//Method to update the browser output
TrackList.method('update', function() {
    $('#trackList').replaceWith(this.getElement());
});

//Static member defining a default set of TrackColumns to render
TrackList.defaultColumns = [
    new TrackColumn('#', TrackColumn.renderNumber),
    new TrackColumn('Title', TrackColumn.renderTitle),
    new TrackColumn('Artists', TrackColumn.renderArtists),
    new TrackColumn('Release', TrackColumn.renderRelease),
    new TrackColumn('Genres', TrackColumn.renderGenres)
];
