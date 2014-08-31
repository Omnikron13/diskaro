//require_once(Track.js)

//Namespace for predefined .sort() callbacks for arrays of Track objs
Track.Sort = {
    //Var controlling where to sort null against non-null property
    //(-1 for nulls at top, 1 for nulls at bottom)
    nullSort: -1,

    //Sort by .trackNumber
    Number: {
        Asc: function(a, b) {
            var x = a.trackNumber - b.trackNumber;
            if(x == 0) return Track.Sort.Title.Asc(a, b);
            return x;
        },
        Desc: function(a, b) {
            var x = b.trackNumber - a.trackNumber;
            if(x == 0) return Track.Sort.Title.Asc(a, b);
            return x;
        },
    },

    //Sort by .name
    Title: {
        Asc: function(a, b) {
            return a.name.localeCompare(b.name);
        },
        Desc: function(a, b) {
            return b.name.localeCompare(a.name);
        },
    },

    //Shorthand for sorting by 'Artist' Role
    Artists: {
        Asc: function(a, b) {
            return Track.Sort.Role.Asc('Artist')(a, b);
        },
        Desc: function(a, b) {
            return Track.Sort.Role.Desc('Artist')(a, b);
        },
    },

    //Sort by .genres
    Genres: {
        Asc: function(a, b) {
            var x = DataList.Sort.Asc(a.genres, b.genres);
            if(x == 0) return Track.Sort.Title.Asc(a, b);
            return x;
        },
        Desc: function(a, b) {
            var x = DataList.Sort.Desc(a.genres, b.genres);
            if(x == 0) return Track.Sort.Title.Asc(a, b);
            return x;
        },
    },

    //Sort by .release.label
    Label: {
        Asc: function(a, b) {
            var al = a.release ? a.release.label : null;
            var bl = b.release ? b.release.label : null;
            if(al == null && bl == null)
                var x = 0;
            else if(al == null)
                var x = Track.Sort.nullSort;
            else if(bl == null)
                var x = Track.Sort.nullSort - Track.Sort.nullSort * 2;
            else
                var x = al.name.localeCompare(bl.name);
            if(x == 0) return Track.Sort.Release.Asc(a, b);
            return x;
        },
        Desc: function(a, b) {
            var al = a.release ? a.release.label : null;
            var bl = b.release ? b.release.label : null;
            if(al == null && bl == null)
                var x = 0;
            else if(al == null)
                var x = Track.Sort.nullSort;
            else if(bl == null)
                var x = Track.Sort.nullSort - Track.Sort.nullSort * 2;
            else
                var x = bl.name.localeCompare(al.name);
            if(x == 0) return Track.Sort.Release.Asc(a, b);
            return x;
        },
    },

    //Sort by .release
    Release: {
        Asc: function(a, b) {
            if(a.release == null && b.release == null)
                var x = 0;
            else if(a.release == null)
                var x = Track.Sort.nullSort;
            else if(b.release == null)
                var x = Track.Sort.nullSort - Track.Sort.nullSort * 2;
            else
                var x = a.release.name.localeCompare(b.release.name);
            if(x == 0) return Track.Sort.Number.Asc(a, b);
            return x;
        },
        Desc: function(a, b) {
            if(a.release == null && b.release == null)
                var x = 0;
            else if(a.release == null)
                var x = Track.Sort.nullSort;
            else if(b.release == null)
                var x = Track.Sort.nullSort - Track.Sort.nullSort * 2;
            else
                var x = b.release.name.localeCompare(a.release.name);
            if(x == 0) return Track.Sort.Number.Asc(a, b);
            return x;
        },
    },

    //Sort by .tags
    Tags: {
        Asc: function(a, b) {
            var x = DataList.Sort.Asc(a.tags, b.tags);
            if(x == 0) return Track.Sort.Title.Asc(a, b);
            return x;
        },
        Desc: function(a, b) {
            var x = DataList.Sort.Desc(a.tags, b.tags);
            if(x == 0) return Track.Sort.Title.Asc(a, b);
            return x;
        },
    },

    //Function to generate callback which sorts by artists matching given Role
    Role: {
        Asc: function(r) {
            return function(a, b) {
                var x = DataList.Sort.Asc(a.getArtistsByRole(r), b.getArtistsByRole(r));
                if(x == 0) return Track.Sort.Title.Asc(a, b);
                return x;
            };
        },
        Desc: function(r) {
            return function(a, b) {
                var x = DataList.Sort.Desc(a.getArtistsByRole(r), b.getArtistsByRole(r));
                if(x == 0) return Track.Sort.Title.Asc(a, b);
                return x;
            };
        },
    },
};
