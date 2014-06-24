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
    public function getRelease() {
        return $this->release;
    }
    public function getTrackNumber() {
        return $this->trackNumber;
    }

    //Override jsonSerialize to include artist, release & track number
    public function jsonSerialize() {
        $json = parent::jsonSerialize();
        if($this->artist != NULL)
            $json['artist'] = $this->artist->jsonSerialize();
        else
            $json['artist'] = NULL;
        if($this->release != NULL)
            $json['release'] = $this->release->jsonSerialize();
        else
            $json['release'] = NULL;
        $json['trackNumber'] = $this->trackNumber;
        return $json;
    }

    public function setPath($path) {
        $this->setField('path', $path, PDO::PARAM_STR);
        $this->path = $path;
    }

    public function setArtist($artist) {
        $this->setField('artistID', $artist->getID(), PDO::PARAM_INT);
        $this->artist = $artist;
    }

    public function setRelease($release) {
        $this->setField('releaseID', $release->getID(), PDO::PARAM_INT);
        $this->release = $release;
    }

    public function setTrackNumber($trackNumber) {
        $this->setField('trackNumber', $trackNumber, PDO::PARAM_INT);
        $this->trackNumber = $trackNumber;
    }

    public static function add($name, $path, $artist = NULL, $release = NULL, $trackNumber = NULL) {
        $db = self::getDB();
        $query = $db->prepare('INSERT INTO tracks(name, path, artistID, releaseID, trackNumber)
            VALUES(:name, :path, :artistID, :releaseID, :trackNumber);');
		$query->bindParam(':name', $name, PDO::PARAM_STR);
		$query->bindParam(':path', $path, PDO::PARAM_STR);
		$query->bindParam(':artistID', ($artist===NULL)?NULL:$artist->getID(), PDO::PARAM_INT);
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
        parent::setupDB();
    }
}

?>
