/*=============*
| Artist table |
*=============*/
CREATE TABLE IF NOT EXISTS artists (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    comments TEXT
);

/*==============================================*
|                Pseudonym Table                |
| This allows grouping alternative artist names |
| e.g. 'Prodigy' & 'The Prodigy'                |
*==============================================*/
CREATE TABLE IF NOT EXISTS artistPseudonyms (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    parentID INTEGER NOT NULL,
    childID INTEGER UNIQUE NOT NULL,
    CHECK (parentID != childID),
    FOREIGN KEY (parentID) REFERENCES artists (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (childID) REFERENCES artists (id) ON DELETE CASCADE ON UPDATE CASCADE
);

--unique index to prevent duplicate pseudonym links
CREATE UNIQUE INDEX IF NOT EXISTS artistPseudonymIndex ON artistPseudonyms (parentID, childID);
