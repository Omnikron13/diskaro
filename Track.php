<?php

require_once('DataCore.php');
require_once('Artist.php');
require_once('Genre.php');
require_once('Label.php');
require_once('Release.php');
require_once('Tag.php');

class Track extends DataCore {
    protected $path = NULL;
    protected $artist = NULL;
    protected $release = NULL;
    protected $trackNumber = NULL;

    //Override constructor to convert artistID & releaseID into objects
    public function __construct($uid, $mode = 0) {
        parent::__construct($uid, $mode);
        if($this->artist != NULL)
            $this->artist = new Artist($this->artist);
        else
            $this->artist = NULL;
        if($this->release != NULL)
            $this->release = new Release($this->release);
        else
            $this->release = NULL;
    }

    //Override constructorBindings from DataCore to add path, artist, release
    // & track number bindings
    protected function constructorBindings($query) {
		$query->bindColumn('path', $this->path, PDO::PARAM_STR);
		$query->bindColumn('artistID', $this->artist, PDO::PARAM_INT);
		$query->bindColumn('releaseID', $this->release, PDO::PARAM_INT);
		$query->bindColumn('trackNumber', $this->trackNumber, PDO::PARAM_INT);
    }

    public function getPath() {
        return $this->path;
    }
    public function getArtist() {
        return $this->artist;
    }
    //should replace with object...
    public function getReleaseID() {
        return $this->releaseID;
    }
    public function getTrackNumber() {
        return $this->trackNumber;
    }

    //Required by JsonSerializable
    //Serialises id, name, path, artist, release ID & track number
    public function jsonSerialize() {
        return [
            'id'          => $this->getID(),
            'name'        => $this->getName(),
            'path'        => $this->getPath(),
            'artist'      => $this->getArtist(),
            'releaseID'   => $this->getReleaseID(),
            'trackNumber' => $this->getTrackNumber(),
        ];
    }

    public function setPath($path) {
        $this->setField('path', $path, PDO::PARAM_STR);
        $this->path = $path;
    }

    public function setArtist($artist) {
        $this->setField('artistID', $artist->getID(), PDO::PARAM_INT);
        $this->artist = $artist;
    }

    public function setTrackNumber($trackNumber) {
        $this->setField('trackNumber', $trackNumber, PDO::PARAM_INT);
        $this->trackNumber = $trackNumber;
    }

    public static function add($name, $path) {
        $db = self::getDB();
        $query = $db->prepare('INSERT INTO tracks(name, path) VALUES(:name, :path);');
		$query->bindParam(':name', $name, PDO::PARAM_STR);
		$query->bindParam(':path', $path, PDO::PARAM_STR);
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
        parent::setupDB();
    }
}

?>
