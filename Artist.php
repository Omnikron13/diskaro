<?php

require_once('DB.php');

class Artist {
    const SCHEMA = './sql/artists.sql';

    protected $id = NULL;
    protected $name = NULL;

    public function __construct($uid) {
        $db = self::getDB();
		        $query = $db->prepare('SELECT * FROM artists WHERE id = :id;');
		        $query->bindParam(':id', $uid, PDO::PARAM_INT);
		$query->execute();
		$query->bindColumn('id', $this->id, PDO::PARAM_INT);
		$query->bindColumn('name', $this->name, PDO::PARAM_STR);
		$query->fetch(PDO::FETCH_BOUND);
    }

    public function getID() {
        return $this->id;
    }
    public function getName() {
        return $this->name;
    }

    public function __toString() {
        return $this->getName();
    }

    public function setName($name) {
        $db = self::getDB();
        $query = $db->prepare('UPDATE artists SET name=:name WHERE id=:id;');
        $query->bindParam(':id', $this->id, PDO::PARAM_INT);
        $query->bindParam(':name', $name, PDO::PARAM_STR);
		$query->execute();
        $this->name = $name;
    }

    public function addParent($artist) {
        foreach($this->getParents() as $p) {
            if($p->getID() == $artist->getID())
                throw new Exception('Collision');
        }
        $db = self::getDB();
        $query = $db->prepare('INSERT INTO artistPseudonyms(parentID, childID) VALUES(:pid, :cid);');
        $query->bindParam(':pid', $artist->getID(), PDO::PARAM_INT);
        $query->bindParam(':cid', $this->getID(), PDO::PARAM_INT);
        $query->execute();
    }

    public function getParents() {
        $db = self::getDB();
        $query = $db->prepare('SELECT parentID FROM artistPseudonyms WHERE childID=:cid;');
        $query->bindParam(':cid', $this->getID(), PDO::PARAM_INT);
        $query->execute();
        $query->bindColumn('parentID', $pid, PDO::PARAM_INT);
        $parents = [];
        while($query->fetch(PDO::FETCH_BOUND)) {
            $parents[] = new self($pid);
        }
        return $parents;
    }

    public static function add($name) {
        $db = self::getDB();
        $query = $db->prepare('INSERT INTO artists(name) VALUES(:name);');
		$query->bindParam(':name', $name, PDO::PARAM_STR);
		$query->execute();
        return new self($db->lastInsertId());
    }

    //
    public static function getAll() {
        $db = self::getDB();
        $query = $db->prepare('SELECT id FROM artists;');
        $query->execute();
        $query->bindColumn('id', $id, PDO::PARAM_INT);
        $artists = [];
        while($query->fetch(PDO::FETCH_BOUND)) {
            $artists[] = new self($id);
        }
        return $artists;
    }

    //
    public static function getLeaves() {
        $sql = 'SELECT artists.id FROM artists LEFT JOIN artistPseudonyms ON artists.id = artistPseudonyms.parentID WHERE artistPseudonyms.parentID IS NULL;';
        $db = self::getDB();
        $query = $db->prepare($sql);
        $query->execute();
        $query->bindColumn('id', $id, PDO::PARAM_INT);
        $artists = [];
        while($query->fetch(PDO::FETCH_BOUND)) {
            $artists[] = new self($id);
        }
        return $artists;
    }

    public static function getDB() {
        return DB::get();
    }

    public static function setupDB() {
        $db = self::getDB();
        $db->exec(file_get_contents(self::SCHEMA));
    }
}

?>
