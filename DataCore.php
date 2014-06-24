<?php

require_once('DB.php');

abstract class DataCore implements JsonSerializable {
    protected $id = NULL;
    protected $name = NULL;

    //Constructor
    public function __construct($uid) {
        $db = static::getDB();
		$query = $db->prepare('SELECT * FROM '.static::getMainTable().' WHERE id = :id;');
		$query->bindParam(':id', $uid, PDO::PARAM_INT);
		$query->execute();
		$query->bindColumn('id', $this->id, PDO::PARAM_INT);
		$query->bindColumn('name', $this->name, PDO::PARAM_STR);
		$query->fetch(PDO::FETCH_BOUND);
    }

    //Get methods
    public function getID() {
        return $this->id;
    }
    public function getName() {
        return $this->name;
    }

    //Set methods
    public function setName($name) {
        $db = static::getDB();
        $query = $db->prepare('UPDATE '.static::getMainTable().' SET name=:name WHERE id=:id;');
        $query->bindParam(':id', $this->id, PDO::PARAM_INT);
        $query->bindParam(':name', $name, PDO::PARAM_STR);
		$query->execute();
        $this->name = $name;
    }

    //Magic methods
    public function __toString() {
        return $this->getName();
    }

    //Required by JsonSerializable
    //Serialises id & name
    public function jsonSerialize() {
        return [
            'id'    => $this->getID(),
            'name'  => $this->getName(),
        ];
    }

    //Static methods
    public static function add($name) {
        $db = static::getDB();
        $query = $db->prepare('INSERT INTO '.static::getMainTable().'(name) VALUES(:name);');
		$query->bindParam(':name', $name, PDO::PARAM_STR);
		$query->execute();
        return new static($db->lastInsertId());
    }

    public static function getAll() {
        $db = static::getDB();
        $query = $db->prepare('SELECT id FROM '.static::getMainTable().';');
        $query->execute();
        $query->bindColumn('id', $id, PDO::PARAM_INT);
        $objects = [];
        while($query->fetch(PDO::FETCH_BOUND)) {
            $objects[] = new static($id);
        }
        return $objects;
    }

    public static function getDB() {
        return DB::get();
    }

    public static function setupDB() {
        $db = static::getDB();
        $db->exec(file_get_contents(static::getSchema()));
    }

    //Abstract static methods
    public static abstract function getMainTable();
    public static abstract function getSchema();
}

?>
