/*===================*
| Generic Tags Table |
*===================*/
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL --should this be unique?
);

/*====================*
| Relationships Table |
*====================*/
CREATE TABLE IF NOT EXISTS subTags (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    parentID INTEGER NOT NULL,
    childID INTEGER NOT NULL,
    CHECK (parentID != childID),
    FOREIGN KEY (parentID) REFERENCES tags (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (childID) REFERENCES tags (id) ON DELETE CASCADE ON UPDATE CASCADE
);

--Index to ensure there are no duplicate sub-tag links
CREATE UNIQUE INDEX IF NOT EXISTS subTagsIndex ON subTags (parentID, childID);
