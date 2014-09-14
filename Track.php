<?php

require_once('DataCore.php');
require_once('Artist.php');
require_once('Genre.php');
require_once('Label.php');
require_once('Release.php');
require_once('Role.php');
require_once('Tag.php');
require_once('ArtistLink.php');

class Track extends DataCore {
    protected $path = NULL;
    protected $release = NULL;
    protected $trackNumber = NULL;
    protected $genres = [];
    protected $tags = [];
    protected $artistLinks = [];

    //Override constructor to convert releaseID into object
    public function __construct($uid, $mode = 0) {
        parent::__construct($uid, $mode);
        $this->release = $this->release==NULL?NULL:new Release($this->release);
        //Load genres
        $this->loadLinks('trackGenres', 'genreID', $this->genres, 'Genre');
        //Load tags
        $this->loadLinks('trackTags', 'tagID', $this->tags, 'Tag');
        //Load artist links
        $this->loadLinks('trackArtists', 'id', $this->artistLinks, 'ArtistLink');
    }

    //Override constructorBindings from DataCore to add path, release
    // & track number bindings
    protected function constructorBindings($query) {
		$query->bindColumn('path', $this->path, PDO::PARAM_STR);
		$query->bindColumn('releaseID', $this->release, PDO::PARAM_INT);
		$query->bindColumn('trackNumber', $this->trackNumber, PDO::PARAM_INT);
    }

    //Utility method to load tag liks (e.g. genre, generic tag) in the constructor
    protected function loadLinks($table, $idField, &$array, $type) {
        $db = static::getDB();
		$query = $db->prepare("SELECT $idField FROM $table WHERE trackID = :id;");
		$query->bindValue(':id', $this->getID(), PDO::PARAM_INT);
		$query->execute();
        $array = array_map(function($id) use($type) {
            $reflection = new ReflectionClass($type);
            return $reflection->newInstanceArgs([intval($id)]);
        }, $query->fetchAll(PDO::FETCH_COLUMN, 0));
    }

    public function getPath() {
        return $this->path;
    }
    public function getRelease() {
        return $this->release;
    }
    public function getYear() {
        return $this->release ? $this->release->getYear() : NULL;
    }
    public function getLabel() {
        return $this->release ? $this->release->getLabel() : NULL;
    }
    public function getTrackNumber() {
        return $this->trackNumber;
    }
    public function getGenres() {
        return $this->genres;
    }
    public function getTags() {
        return $this->tags;
    }
    public function getArtistLinks() {
        return $this->artistLinks;
    }
    public function getArtists() {
        return array_values(array_unique(array_map(function($link) {
            return $link->getArtist();
        }, $this->getArtistLinks())));
    }

    //Set methods
    public function setPath($path) {
        $this->setField('path', $path, PDO::PARAM_STR);
        $this->path = $path;
    }

    public function setRelease($release) {
        if($release != null)
            $this->setField('releaseID', $release->getID(), PDO::PARAM_INT);
        else
            $this->setField('releaseID', NULL, PDO::PARAM_NULL);
        $this->release = $release;
    }

    public function setTrackNumber($trackNumber) {
        $this->setField('trackNumber', $trackNumber, PDO::PARAM_INT);
        $this->trackNumber = $trackNumber;
    }

    //Method for adding a new genre tag to the track
    public function addGenre($genre) {
        $this->addLink($genre, 'trackGenres', 'genreID', $this->genres);
    }

    //Method for removing a genre tag from the track
    public function removeGenre($genre) {
        $this->removeLink($genre, 'trackGenres', 'genreID', $this->genres);
    }

    //Method for adding a new generic tag to the track
    public function addTag($tag) {
        $this->addLink($tag, 'trackTags', 'tagID', $this->tags);
    }

    //Method for removing a generic tag from the track
    public function removeTag($tag) {
        $this->removeLink($tag, 'trackTags', 'tagID', $this->tags);
    }

    //Method for adding a new artist tag to the track
    public function addArtist($artist, $role = NULL) {
        $this->addLink($artist, 'trackArtists', 'artistID', $this->artistLinks);
        $db = static::getDB();
        $link = new ArtistLink($db->lastInsertId());
        $this->artistLinks[array_Search($artist, $this->artistLinks)] = $link;
        $link->setRole($role);
    }

    //Method for removing an artist tag from the track
    public function removeArtist($artist, $role = NULL) {
        $this->removeLink(ArtistLink::get($this, $artist, $role), 'trackArtists', 'id', $this->artistLinks);
    }

    //Utility method for adding db links (e.g. genre, generic tag)
    protected function addLink($link, $table, $idField, &$array) {
        $db = static::getDB();
        $query = $db->prepare("INSERT INTO $table(trackID, $idField) VALUES(:tid, :lid);");
        $query->bindValue(':tid', $this->getID(), PDO::PARAM_INT);
        $query->bindValue(':lid', $link->getID(), PDO::PARAM_INT);
        $query->execute();
        $array[] = $link;
    }

    //Utility method for removing tags (e.g. genre, generic tag, etc.)
    protected function removeLink($link, $table, $idField, &$array) {
        $db = static::getDB();
        $query = $db->prepare("DELETE FROM $table WHERE trackID=:tid AND $idField=:lid;");
        $query->bindValue(':tid', $this->getID(), PDO::PARAM_INT);
        $query->bindValue(':lid', $link->getID(), PDO::PARAM_INT);
        $query->execute();
        unset($array[array_Search($link, $array)]);
        $array = array_values($array);
    }

    //Override DataCore->update() to update path, release, trackNumber, genres, tags & artistLinks
    public function update($data) {
        //Let DataCore perform its updates
        parent::update($data);
        //Update path if different
        if($data->path != $this->getPath())
            $this->setPath($data->path);
        //Convert new release to object (if applicable)
        if($data->releaseID != null)
            $release = new Release($data->releaseID);
        //Update release if different
        if($release != $this->getRelease())
            $this->setRelease($release);
        //Update trackNumber if different
        if($data->trackNumber != $this->getTrackNumber())
            $this->setTrackNumber($data->trackNumber);
        //Update data arrays (genres & tags)
        $this->updateData($data->genreIDs, 'Genre');
        $this->updateData($data->tagIDs, 'Tag');
        //Convert new artistLinks into artist/role pairs
        $data->artistLinks = array_map(function($al) {
            return [
                new Artist($al->artistID),
                new Role($al->roleID),
            ];
        }, $data->artistLinks);
        //Convert old artistLinks into artist/role pairs
        $artistLinks = array_map(function($al) {
            return [
                $al->getArtist(),
                $al->getRole(),
            ];
        }, $this->getArtistLinks());
        //Add Artists/ArtistLinks
        foreach($data->artistLinks as $al) {
            if(!in_array($al, $artistLinks))
                $this->addArtist($al[0], $al[1]);
        }
        //Remove Artists/ArtistLinks
        foreach($artistLinks as $al) {
            if(!in_array($al, $data->artistLinks))
                $this->removeArtist($al[0], $al[1]);
        }
        return $this;
    }

    //Method to abstract the update() logic for (Sub)DataCore arrays
    protected function updateData($data, $class) {
        //Construct get/add/remove method strings
        $get    = 'get'.$class.'s';
        $add    = 'add'.$class;
        $remove = 'remove'.$class;
        //Get old/current data array
        $oldData = $this->$get();
        //Convert data array to objects
        $data = array_map(function($id) use ($class) {
            return new $class($id);
        }, $data);
        //Add data links
        foreach(array_diff($data, $oldData) as $d) {
            $this->$add($d);
        }
        //Remove data links
        foreach(array_diff($oldData, $data) as $d) {
            $this->$remove($d);
        }
    }

    //Override DataCore->add() to allow optional release & trackNumber
    public static function add($name, $path = NULL, $release = NULL, $trackNumber = NULL) {
        $db = self::getDB();
        $query = $db->prepare('INSERT INTO tracks(name, path, releaseID, trackNumber)
            VALUES(:name, :path, :releaseID, :trackNumber);');
		$query->bindValue(':name', $name, PDO::PARAM_STR);
		$query->bindValue(':path', $path, PDO::PARAM_STR);
		$query->bindValue(':releaseID', ($release===NULL)?NULL:$release->getID(), PDO::PARAM_INT);
		$query->bindValue(':trackNumber', $trackNumber, PDO::PARAM_INT);
		$query->execute();
        return new self($db->lastInsertId());
    }

    //Implement abstract static methods from DataCore
    public static function getMainTable() {
        return 'tracks';
    }
    public static function getSchema() {
        return './sql/tracks.sql';
    }

    //Override setupDB from DataCore to setup dependencies first
    public static function setupDB() {
        Artist::setupDB();
        Genre::setupDB();
        Label::setupDB();
        Release::setupDB();
        Tag::setupDB();
        Role::setupDB();
        parent::setupDB();
    }
}

//Set default JSON fields to serialise (path, releaseID, trackNumber,
//genreIDs, tagIDs & artistLinks)
Track::addJsonField('path', function($d) {
    return $d->getPath();
});
Track::addJsonField('releaseID', function($d) {
    $r = $d->getRelease();
    return $r ? $r->getID() : null;
});
Track::addJsonField('trackNumber', function($d) {
    return $d->getTrackNumber();
});
Track::addJsonField('genreIDs', function($d) {
    return array_map(function($d) {
        return $d->getID();
    }, $d->getGenres());
});
Track::addJsonField('tagIDs', function($d) {
    return array_map(function($d) {
        return $d->getID();
    }, $d->getTags());
});
Track::addJsonField('artistLinks', function($d) {
    return $d->getArtistLinks();
});

//Add getTrackIDs() method to Release - returns array of IDs of Tracks which
//reference this Release with their releaseID field in the DB
Release::add_method('getTrackIDs', function() {
    $db = static::getDB();
    $query = $db->prepare('SELECT id FROM tracks WHERE releaseID=:id;');
    $query->bindValue(':id', $this->getID(), PDO::PARAM_INT);
    $query->execute();
    return array_map(function($id) {
        return intval($id, 10);
    }, $query->fetchAll(PDO::FETCH_COLUMN, 0));
});

//Add getTracks() method to Release - returns array of Track objects which
//reference this Release with their releaseID field in the DB
Release::add_method('getTracks', function() {
    return array_map(function($id) {
        return new Track($id);
    }, $this->getTrackIDs());
});

?>
