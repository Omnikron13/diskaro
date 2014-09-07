<?php

require_once('DB.php');

abstract class DataCore implements JsonSerializable {
    protected $id = NULL;
    protected $name = NULL;
    protected $comments = NULL;

    //Constructor
    public function __construct($uid, $mode = 0) {
        $db = static::getDB();
        switch($mode) {
            case 0:
		        $query = $db->prepare('SELECT * FROM '.static::getMainTable().' WHERE id = :id;');
		        $query->bindValue(':id', $uid, PDO::PARAM_INT);
                break;
            case 1:
                if(!static::nameUnique())
                    throw new Exception('Cannot construct from name; not a unique identifier');
		        $query = $db->prepare('SELECT * FROM '.static::getMainTable().' WHERE name = :name;');
		        $query->bindValue(':name', $uid, PDO::PARAM_STR);
                break;
        }
		$query->execute();
		$query->bindColumn('id', $this->id, PDO::PARAM_INT);
		$query->bindColumn('name', $this->name, PDO::PARAM_STR);
		$query->bindColumn('comments', $this->comments, PDO::PARAM_STR);
        $this->constructorBindings($query);
		$query->fetch(PDO::FETCH_BOUND);
    }

    //Placeholder method which can be overridden to add extra column bindings
    protected function constructorBindings($query) {
    }

    //Get methods
    public function getID() {
        return $this->id;
    }
    public function getName() {
        return $this->name;
    }
    public function getComments() {
        return $this->comments;
    }

    //Set methods
    public function setName($name) {
        static::setField('name', $name, PDO::PARAM_STR);
        $this->name = $name;
    }
    public function setComments($comments) {
        static::setField('comments', $comments, PDO::PARAM_STR);
        $this->comments = $comments;
    }

    //Generic utility method for setting database fields
    protected function setField($field, $value, $type) {
        $db = static::getDB();
        $query = $db->prepare('UPDATE '.static::getMainTable()." SET $field=:value WHERE id=:id;");
        $query->bindValue(':id', $this->id, PDO::PARAM_INT);
        $query->bindValue(':value', $value, $type);
		$query->execute();
    }

    //Magic methods
    public function __toString() {
        return $this->getName();
    }

    //Required by JsonSerializable
    //Serialises id, name & comments
    public function jsonSerialize() {
        return [
            'id'       => $this->getID(),
            'name'     => $this->getName(),
            'comments' => $this->getComments(),
        ];
    }

    //Method to update/edit DB record based on 'plain' object holding new
    //values. Should be overridden as applicable down the inheritance chain.
    public function update($data) {
        //Abort if the passed obj doesn't correspond to the correct DB record
        if($data->id && $data->id != $this->getID())
            throw new Exception('Update ID mismatch'); //Should be custom
        //Update name if different
        if($data->name != $this->getName())
            $this->setName($data->name);
        //Update comments if different
        if($data->comments != $this->getComments())
            $this->setComments($data->comments);
        return $this;
    }

    //Static methods
    public static function add($name) {
        $db = static::getDB();
        $query = $db->prepare('INSERT INTO '.static::getMainTable().'(name) VALUES(:name);');
		$query->bindValue(':name', $name, PDO::PARAM_STR);
		$query->execute();
        return new static($db->lastInsertId());
    }

    //Method to add new DB records based on JSON input (e.g. from a UI)
    //Should be overridden down the inheritance chain as needed.
    public static function addJSON($json) {
        $json = json_decode($json);
        return static::add($json->name)->update($json);
    }

    //Method to delete a record from the DB
    public static function remove($id) {
        //If passed a DataCore obj extract just the id
        if(is_a($id, 'DataCore'))
            $id = $id->getID();
        //Remove specified record from DB
        $db = static::getDB();
        $query = $db->prepare('DELETE FROM '.static::getMainTable().' WHERE id=:id;');
        $query->bindValue(':id', $id, PDO::PARAM_INT);
        $query->execute();
        return $query->rowCount();
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

    //Convenience method for returning an arbitrarily filtered subset of getAll()
    public static function getFiltered($callback) {
        return array_values(array_filter(static::getAll(), $callback));
    }

    //Processes a request for serialised data from the DB
    public static function jsonRequest($class, $constraint) {
        switch($constraint['type']) {
            case null:
                $data = $class::getAll();
                break;
            case 'id':
                $data = new $class($constraint['data']);
                break;
            case 'filter':
                $data = $class::getFiltered(Filter::load($constraint['data']));
                break;
            default:
                throw new Exception('Unknown request constraint');
        }
        return json_encode($data);
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
