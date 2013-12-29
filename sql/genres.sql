/*============*
| Genre Table |
*============*/
CREATE TABLE IF NOT EXISTS genres (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

/*====================*
| Relationships Table |
*====================*/
CREATE TABLE IF NOT EXISTS subGenres ( --name..?
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    parentID INTEGER NOT NULL,
    childID INTEGER NOT NULL, --should this be unique? or multiple parents allowed?
    CHECK (parentID != childID),
    FOREIGN KEY (parentID) REFERENCES genres (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (childID) REFERENCES genres (id) ON DELETE CASCADE ON UPDATE CASCADE
);
