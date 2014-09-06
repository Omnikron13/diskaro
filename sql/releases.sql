/*=========================================*
|           Release/Album Table            |
| This one could be tricky, so is very WIP |
*=========================================*/
CREATE TABLE IF NOT EXISTS releases (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, --null perhaps allowed for untitled..?
    --perhaps subtitle field?
--    artistID INTEGER NOT NULL, --and what of compilations or dual releases?
    year INTEGER, --perhaps nulls allowed where incomplete/unknown. date instead?
    labelID INTEGER,
    comments TEXT,
    FOREIGN KEY (labelID) REFERENCES labels (id) ON DELETE SET NULL ON UPDATE CASCADE
);
