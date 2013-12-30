/*=============*
| Artist table |
*=============*/
CREATE TABLE IF NOT EXISTS artists (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

/*==============================================*
|                Pseudonym Table                |
| This allows grouping alternative artist names |
| e.g. 'Prodigy' & 'The Prodigy'                |
*==============================================*/
CREATE TABLE IF NOT EXISTS artistPseudonyms (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    canonicalID INTEGER NOT NULL,
    pseudonymID INTEGER UNIQUE NOT NULL,
    CHECK (canonicalID != pseudonymID),
    FOREIGN KEY (canonicalID) REFERENCES artists (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (pseudonymID) REFERENCES artists (id) ON DELETE CASCADE ON UPDATE CASCADE
);

--unique index to prevent duplicate pseudonym links
CREATE UNIQUE INDEX IF NOT EXISTS artistPseudonymIndex ON artistPseudonyms (canonicalID, pseudonymID);
