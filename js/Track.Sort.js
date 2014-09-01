//require_once(Track.js)
//require_once(DataList.All.js)

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

    //Sort by .release.label
    Label: {
        Asc: function(a, b) {
            var ar = a.getRelease();
            var br = b.getRelease();
            var al = ar ? ar.label : null;
            var bl = br ? br.label : null;
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
            var ar = a.getRelease();
            var br = b.getRelease();
            var al = ar ? ar.label : null;
            var bl = br ? br.label : null;
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
            var ar = a.getRelease();
            var br = b.getRelease();
            if(ar == null && br == null)
                var x = 0;
            else if(ar == null)
                var x = Track.Sort.nullSort;
            else if(br == null)
                var x = Track.Sort.nullSort - Track.Sort.nullSort * 2;
            else
                var x = ar.name.localeCompare(br.name);
            if(x == 0) return Track.Sort.Number.Asc(a, b);
            return x;
        },
        Desc: function(a, b) {
            var ar = a.getRelease();
            var br = b.getRelease();
            if(ar == null && br == null)
                var x = 0;
            else if(ar == null)
                var x = Track.Sort.nullSort;
            else if(br == null)
                var x = Track.Sort.nullSort - Track.Sort.nullSort * 2;
            else
                var x = br.name.localeCompare(ar.name);
            if(x == 0) return Track.Sort.Number.Asc(a, b);
            return x;
        },
    },

    //Function to generate asc/desc pair to sort by DataList returned by getDL
    DataList: function(getDL) {
        return {
            Asc: function(a, b) {
                var x = DataList.Sort.Asc(getDL(a), getDL(b));
                return x == 0 ? Track.Sort.Title.Asc(a, b) : x;
            },
            Desc: function(a, b) {
                var x = DataList.Sort.Desc(getDL(a), getDL(b));
                return x == 0 ? Track.Sort.Title.Asc(a, b) : x;
            },
        };
    },

    //Shorthand for creating .getArtistsByRole() Track.Sort.DataList pair
    Role: function(r) {
        return Track.Sort.DataList(function(t) {
            return t.getArtistsByRole(r);
        });
    },
};

//Shorthand for .genres Track.Sort.DataList sort
Track.Sort.Genres = Track.Sort.DataList(function(t) {
    return t.getGenres();
});

//Shorthand for .tags Track.Sort.DataList sort
Track.Sort.Tags = Track.Sort.DataList(function(t) {
    return t.getTags();
});

//Shorthand for primary artist Role (default; 'Artist') callbacks
Track.Sort.Role.Artist = Track.Sort.Role('Artist');
