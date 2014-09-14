<?php

require_once('DB.php');
require_once('TAddMethod.php');

abstract class DataCore implements JsonSerializable {
    use TAddMethod;

    protected $id = NULL;
    protected $name = NULL;
    protected $comments = NULL;

    //Init array to store field/callback pairs defining how to serialise
    //this class & its children to JSON (via json_encode())
    protected static $jsonFields = [];

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

    //Method to get array of IDs of DB records which reference this from given table
    protected function getLinkIDs($table, $thisIDField, $thatIDField = 'id') {
        $db = static::getDB();
        $query = $db->prepare("SELECT $thatIDField FROM $table WHERE $thisIDField=:id;");
        $query->bindValue(':id', $this->getID(), PDO::PARAM_INT);
        $query->execute();
        return array_values(
            array_unique(
                array_map(function($id) {
                    return intval($id, 10);
                }, $query->fetchAll(PDO::FETCH_COLUMN, 0))
            )
        );
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
    //Serialises all appropriate fields defined in static::$jsonFields array
    public function jsonSerialize() {
        return array_map(function($callback) {
            return $callback($this);
        }, static::getJsonFields());
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

    //Method to add a new JSON field to serialised output of instances of this
    //class, and a callback function to generate the field contents
    public static function addJsonField($name, $callback) {
        static::$jsonFields[get_called_class()][$name] = $callback;
    }

    //Method to get array of field/callback pairs of fields to serialise for
    //this class, recursively merged with those of any/all parents
    protected static function getJsonFields() {
        $class  = get_called_class();
        $parent = get_parent_class($class);
        $fields = array_key_exists($class, static::$jsonFields) ?
            static::$jsonFields[$class] : [];
        return array_merge($fields, $parent ? $parent::getJsonFields() : []);
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

//Set default JSON fields to serialise (id, name & comments)
DataCore::addJsonField('id', function($d) {
    return $d->getID();
});
DataCore::addJsonField('name', function($d) {
    return $d->getName();
});
DataCore::addJsonField('comments', function($d) {
    return $d->getComments();
});

?>
