<?php

require_once('DB.php');
require_once('Artist.php');
require_once('Genre.php');

class Track implements JsonSerializable {
    const SCHEMA = './sql/tracks.sql';

    protected $id = NULL;
    protected $name = NULL;
    protected $path = NULL;
    protected $artist = NULL;
    //should replace with object...
    protected $releaseID = NULL;
    protected $trackNumber = NULL;

    //
    public function __construct($uid) {
        $db = self::getDB();
		$query = $db->prepare('SELECT * FROM tracks WHERE id = :id;');
		$query->bindParam(':id', $uid, PDO::PARAM_INT);
		$query->execute();
		$query->bindColumn('id', $this->id, PDO::PARAM_INT);
		$query->bindColumn('name', $this->name, PDO::PARAM_STR);
		$query->bindColumn('path', $this->path, PDO::PARAM_STR);
		$query->bindColumn('artistID', $artistID, PDO::PARAM_INT);
        //should replace with object...
		$query->bindColumn('releaseID', $this->releaseID, PDO::PARAM_INT);
		$query->bindColumn('trackNumber', $this->trackNumber, PDO::PARAM_INT);
		$query->fetch(PDO::FETCH_BOUND);
        if($artistID != NULL)
            $this->artist = new Artist($artistID);
    }

    public function getID() {
        return $this->id;
    }
    public function getName() {
        return $this->name;
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

    public function setName($name) {
        $db = self::getDB();
        $query = $db->prepare('UPDATE tracks SET name=:name WHERE id=:id;');
        $query->bindParam(':id', $this->id, PDO::PARAM_INT);
        $query->bindParam(':name', $name, PDO::PARAM_STR);
		$query->execute();
        $this->name = $name;
    }

    public function setPath($path) {
        $db = self::getDB();
        $query = $db->prepare('UPDATE tracks SET path=:path WHERE id=:id;');
        $query->bindParam(':id', $this->id, PDO::PARAM_INT);
        $query->bindParam(':path', $path, PDO::PARAM_STR);
		$query->execute();
        $this->path = $path;
    }

    public function setArtist($artist) {
        $db = self::getDB();
        $query = $db->prepare('UPDATE tracks SET artistID=:artistID WHERE id=:id;');
        $query->bindParam(':id', $this->id, PDO::PARAM_INT);
        $query->bindParam(':artistID', $artist->getID(), PDO::PARAM_INT);
		$query->execute();
        $this->artist = $artist;
    }

    public function setTrackNumber($trackNumber) {
        $db = self::getDB();
        $query = $db->prepare('UPDATE tracks SET trackNumber=:trackNumber WHERE id=:id;');
        $query->bindParam(':id', $this->id, PDO::PARAM_INT);
        $query->bindParam(':trackNumber', $trackNumber, PDO::PARAM_STR);
		$query->execute();
        $this->trackNumber = $trackNumber;
    }

    public function __toString() {
        return $this->getName();
    }

    public static function add($name, $path) {
        $db = self::getDB();
        $query = $db->prepare('INSERT INTO tracks(name, path) VALUES(:name, :path);');
		$query->bindParam(':name', $name, PDO::PARAM_STR);
		$query->bindParam(':path', $path, PDO::PARAM_STR);
		$query->execute();
        return new self($db->lastInsertId());
    }

    //
    public static function getAll() {
        $db = self::getDB();
        $query = $db->prepare('SELECT id FROM tracks;');
        $query->execute();
        $query->bindColumn('id', $id, PDO::PARAM_INT);
        $tracks = [];
        while($query->fetch(PDO::FETCH_BOUND)) {
            $tracks[] = new self($id);
        }
        return $tracks;
    }

    public static function getDB() {
        return DB::get();
    }

    public static function setupDB() {
        Artist::setupDB();
        Genre::setupDB();
        $db = self::getDB();
        $db->exec(file_get_contents('./sql/labels.sql'));
        $db->exec(file_get_contents('./sql/releases.sql'));
        $db->exec(file_get_contents('./sql/tags.sql'));
        $db->exec(file_get_contents(self::SCHEMA));
    }
}

?>
