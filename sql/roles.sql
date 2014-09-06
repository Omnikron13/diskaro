/*===================*
| Artist roles table |
*===================*/
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    comments TEXT
);

/*====================*
| Relationships Table |
*====================*/
CREATE TABLE IF NOT EXISTS subRoles (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    parentID INTEGER NOT NULL,
    childID INTEGER UNIQUE NOT NULL,
    CHECK (parentID != childID),
    FOREIGN KEY (parentID) REFERENCES roles (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (childID) REFERENCES roles (id) ON DELETE CASCADE ON UPDATE CASCADE
);

--unique index to prevent duplicate subrole links
CREATE UNIQUE INDEX IF NOT EXISTS subRolesIndex ON subRoles (parentID, childID);
