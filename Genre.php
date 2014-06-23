<?php

require_once('DB.php');

class Genre {
    const SCHEMA = './sql/genres.sql';

    protected $id = NULL;
    protected $name = NULL;

    public function __construct($uid, $mode = 0) {
        $db = self::getDB();
        //mode
        switch($mode) {
            case 0:
		        $query = $db->prepare('SELECT * FROM genres WHERE id = :id;');
		        $query->bindParam(':id', $uid, PDO::PARAM_INT);
                break;
            case 1:
		        $query = $db->prepare('SELECT * FROM genres WHERE name = :name;');
		        $query->bindParam(':name', $uid, PDO::PARAM_STR);
                break;
        }
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
        $query = $db->prepare('UPDATE genres SET name=:name WHERE id=:id;');
        $query->bindParam(':id', $this->id, PDO::PARAM_INT);
        $query->bindParam(':name', $name, PDO::PARAM_STR);
		$query->execute();
        $this->name = $name;
    }

    public function addParent($genre) {
        foreach($this->getParents() as $p) {
            if($p->getID() == $genre->getID())
                throw new Exception('Collision');
        }
        $db = self::getDB();
        $query = $db->prepare('INSERT INTO subGenres(parentID, childID) VALUES(:pid, :cid);');
        $query->bindParam(':pid', $genre->getID(), PDO::PARAM_INT);
        $query->bindParam(':cid', $this->getID(), PDO::PARAM_INT);
        $query->execute();
    }

    public function getParents() {
        $db = self::getDB();
        $query = $db->prepare('SELECT parentID FROM subGenres WHERE childID=:cid;');
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
        $query = $db->prepare('INSERT INTO genres(name) VALUES(:name);');
		$query->bindParam(':name', $name, PDO::PARAM_STR);
		$query->execute();
        return new self($db->lastInsertId());
    }

    //
    public static function getAll() {
        $db = self::getDB();
        $query = $db->prepare('SELECT id FROM genres;');
        $query->execute();
        $query->bindColumn('id', $id, PDO::PARAM_INT);
        $genres = [];
        while($query->fetch(PDO::FETCH_BOUND)) {
            $genres[] = new self($id);
        }
        return $genres;
    }

    //
    public static function getLeaves() {
        $sql = 'SELECT genres.id FROM genres LEFT JOIN subGenres ON genres.id = subGenres.parentID WHERE subGenres.parentID IS NULL;';
        $db = self::getDB();
        $query = $db->prepare($sql);
        $query->execute();
        $query->bindColumn('id', $id, PDO::PARAM_INT);
        $genres = [];
        while($query->fetch(PDO::FETCH_BOUND)) {
            $genres[] = new self($id);
        }
        return $genres;
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
