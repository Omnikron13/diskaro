<?php

require_once('DB.php');
require_once('Artist.php');
require_once('Role.php');

class ArtistLink implements JsonSerializable {
    protected $id = NULL;
    protected $artist = NULL;
    protected $role = NULL;

    public function __construct($id) {
        $this->id = $id;
        $db = static::getDB();
        $query = $db->prepare('SELECT artistID, roleID FROM trackArtists WHERE id=:id;');
        $query->bindParam(':id', $id, PDO::PARAM_INT);
        $query->execute();
        $query->bindColumn('artistID', $this->artist, PDO::PARAM_INT);
        $query->bindColumn('roleID', $this->role, PDO::PARAM_INT);
        $query->fetch(PDO::FETCH_BOUND);
        $this->artist = new Artist($this->artist);
        $this->role = $this->role==NULL?NULL:new Role($this->role);
    }

    public function getID() {
        return $this->id;
    }
    public function getArtist() {
        return $this->artist;
    }
    public function getRole() {
        return $this->role;
    }

    public function setRole($role) {
        $db = static::getDB();
        $query = $db->prepare('UPDATE trackArtists SET roleID=:rid WHERE id=:id;');
        $query->bindParam(':id', $this->getID(), PDO::PARAM_INT);
        if($role === NULL)
            $query->bindValue(':rid', NULL, PDO::PARAM_NULL);
        else
            $query->bindParam(':rid', $role->getID(), PDO::PARAM_INT);
        $query->execute();
        $this->role = $role;
    }

    //Required by JsonSerializable
    public function jsonSerialize() {
        return [
            'artist' => $this->artist,
            'role'   => $this->role,
        ];
    }

    //Creates an instance from track, artist & role rather than id
    public static function get($track, $artist, $role = NULL) {
        $db = static::getDB();
        if($role == NULL)
            $query = $db->prepare('SELECT id FROM trackArtists WHERE trackID=:tid AND artistID=:aid AND roleID ISNULL;');
        else {
            $query = $db->prepare('SELECT id FROM trackArtists WHERE trackID=:tid AND artistID=:aid AND roleID=:rid;');
            $query->bindParam(':rid', $role->getID(), PDO::PARAM_INT);
        }
        $query->bindParam(':tid', $track->getID(), PDO::PARAM_INT);
        $query->bindParam(':aid', $artist->getID(), PDO::PARAM_INT);
        $query->execute();
        $query->bindColumn('id', $id, PDO::PARAM_INT);
        $query->fetch(PDO::FETCH_BOUND);
        return new static($id);
    }

    public static function getDB() {
        return DB::get();
    }
}

?>
