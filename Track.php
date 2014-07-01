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
		$query->bindParam(':id', $this->getID(), PDO::PARAM_INT);
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
        }$this->getArtistLinks())));
    }

    //Override jsonSerialize to include release & track number
    public function jsonSerialize() {
        $json = parent::jsonSerialize();
        $json['release'] = $this->release==NULL?NULL:$this->release->jsonSerialize();
        $json['trackNumber'] = $this->trackNumber;
        $json['genres'] = $this->genres;
        $json['tags'] = $this->tags;
        $json['artistsLinks'] = $this->artistLinks;
        return $json;
    }

    //Set methods
    public function setPath($path) {
        $this->setField('path', $path, PDO::PARAM_STR);
        $this->path = $path;
    }

    public function setRelease($release) {
        $this->setField('releaseID', $release->getID(), PDO::PARAM_INT);
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
        $query->bindParam(':tid', $this->getID(), PDO::PARAM_INT);
        $query->bindParam(':lid', $link->getID(), PDO::PARAM_INT);
        $query->execute();
        $array[] = $link;
    }

    //Utility method for removing tags (e.g. genre, generic tag, etc.)
    protected function removeLink($link, $table, $idField, &$array) {
        $db = static::getDB();
        $query = $db->prepare("DELETE FROM $table WHERE trackID=:tid AND $idField=:lid;");
        $query->bindParam(':tid', $this->getID(), PDO::PARAM_INT);
        $query->bindParam(':lid', $link->getID(), PDO::PARAM_INT);
        $query->execute();
        unset($array[array_Search($link, $array)]);
        $array = array_values($array);
    }

    //Override DataCore->add() to allow optional release & trackNumber
    public static function add($name, $path, $release = NULL, $trackNumber = NULL) {
        $db = self::getDB();
        $query = $db->prepare('INSERT INTO tracks(name, path, releaseID, trackNumber)
            VALUES(:name, :path, :releaseID, :trackNumber);');
		$query->bindParam(':name', $name, PDO::PARAM_STR);
		$query->bindParam(':path', $path, PDO::PARAM_STR);
		$query->bindParam(':releaseID', ($release===NULL)?NULL:$release->getID(), PDO::PARAM_INT);
		$query->bindParam(':trackNumber', $trackNumber, PDO::PARAM_INT);
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

?>
