/*=============*
| Record Label |
*=============*/
CREATE TABLE IF NOT EXISTS labels (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    comments TEXT
);

/*====================*
| Relationships Table |
*====================*/
CREATE TABLE IF NOT EXISTS subLabels (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    parentID INTEGER NOT NULL,
    childID INTEGER NOT NULL, --should this be unique? or multiple parents allowed?
    CHECK (parentID != childID),
    FOREIGN KEY (parentID) REFERENCES labels (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (childID) REFERENCES labels (id) ON DELETE CASCADE ON UPDATE CASCADE
);

--Index to ensure there are no duplicate sub-genre links
CREATE UNIQUE INDEX IF NOT EXISTS subLabelsIndex ON subLabels (parentID, childID);
