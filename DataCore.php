<?php

require_once('DB.php');

abstract class DataCore implements JsonSerializable {
    protected $id = NULL;
    protected $name = NULL;

    //Constructor
    public function __construct($uid, $mode = 0) {
        $db = static::getDB();
        switch($mode) {
            case 0:
		        $query = $db->prepare('SELECT * FROM '.static::getMainTable().' WHERE id = :id;');
		        $query->bindParam(':id', $uid, PDO::PARAM_INT);
                break;
            case 1:
                if(!static::nameUnique())
                    throw new Exception('Cannot construct from name; not a unique identifier');
		        $query = $db->prepare('SELECT * FROM '.static::getMainTable().' WHERE name = :name;');
		        $query->bindParam(':name', $uid, PDO::PARAM_STR);
                break;
        }
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
        static::setField('name', $name, PDO::PARAM_STR);
        $this->name = $name;
    }

    //Generic utility method for setting database fields
    protected function setField($field, $value, $type) {
        $db = static::getDB();
        $query = $db->prepare('UPDATE '.static::getMainTable()." SET $field=:value WHERE id=:id;");
        $query->bindParam(':id', $this->id, PDO::PARAM_INT);
        $query->bindParam(':value', $value, $type);
		$query->execute();
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

    //By default the 'name' column is considered non-unique;
    //override this to return true if name should be unique
    protected static function nameUnique() {
        return false;
    }

    //Abstract static methods
    public static abstract function getMainTable();
    public static abstract function getSchema();
}

?>
