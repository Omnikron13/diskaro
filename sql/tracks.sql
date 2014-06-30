/*=======================*
|      Track Table       |
| This is the big one... |
*=======================*/
CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, --maybe null for untitled?
    path TEXT UNIQUE,
    --possible subtitle column?
    artistID INTEGER,-- NOT NULL, --what about unknown/incomplete? also, remixers/etc?
    releaseID INTEGER,-- NOT NULL, --ditto ^
    trackNumber INTEGER,
    FOREIGN KEY (artistID) REFERENCES artists (id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (releaseID) REFERENCES releases (id) ON DELETE SET NULL ON UPDATE CASCADE
    --perhaps cascade deletes for easy removal of artists/release from the db?
);

--table for tagging generic tags
CREATE TABLE IF NOT EXISTS trackTags (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    trackID INTEGER NOT NULL,
    tagID INTEGER NOT NULL,
    FOREIGN KEY (trackID) REFERENCES tracks (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (tagID) REFERENCES tags (id) ON DELETE CASCADE ON UPDATE CASCADE
);

--table for tagging genres
CREATE TABLE IF NOT EXISTS trackGenres (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    trackID INTEGER NOT NULL,
    genreID INTEGER NOT NULL,
    FOREIGN KEY (trackID) REFERENCES tracks (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (genreID) REFERENCES genres (id) ON DELETE CASCADE ON UPDATE CASCADE
);

--table for tagging artists involved
CREATE TABLE IF NOT EXISTS trackArtists (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    trackID INTEGER NOT NULL,
    artistID INTEGER NOT NULL,
    roleID INTEGER,
    FOREIGN KEY (trackID) REFERENCES tracks (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (artistID) REFERENCES artists (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (roleID) REFERENCES roles (id) ON DELETE CASCADE ON UPDATE CASCADE
);

--indexes to prevent duplicate genre/tag/artist links
CREATE UNIQUE INDEX IF NOT EXISTS trackTagsIndex ON trackTags (trackID, tagID);
CREATE UNIQUE INDEX IF NOT EXISTS trackGenresIndex ON trackGenres (trackID, genreID);
CREATE UNIQUE INDEX IF NOT EXISTS trackArtistsIndex ON trackArtists (trackID, artistID, roleID);
