<?php

require_once('DataCore.php');

abstract class SubDataCore extends DataCore {
    //Instance methods
    public function addParent($parent) {
        foreach($this->getParents() as $p) {
            if($p->getID() == $parent->getID())
                throw new Exception('Collision');
        }
        $db = static::getDB();
        $query = $db->prepare('INSERT INTO '.static::getSubTable().'(parentID, childID) VALUES(:pid, :cid);');
        $query->bindParam(':pid', $parent->getID(), PDO::PARAM_INT);
        $query->bindParam(':cid', $this->getID(), PDO::PARAM_INT);
        $query->execute();
    }

    public function getParents() {
        return array_map(function($pid) {
            return new static($pid);
        }, $this->getParentIDs());
    }

    protected function getParentIDs() {
        $db = static::getDB();
        $query = $db->prepare('SELECT parentID FROM '.static::getSubTable().' WHERE childID=:cid;');
        $query->bindParam(':cid', $this->getID(), PDO::PARAM_INT);
        $query->execute();
        return $query->fetchAll(PDO::FETCH_COLUMN, 0);
    }

    //Override jsonSerialize to include parent IDs
    public function jsonSerialize() {
        $json = parent::jsonSerialize();
        $json['parentIDs'] = $this->getParentIDs();
        return $json;
    }

    //Static methods
    public static function getLeaves() {
        $mainTable = static::getMainTable();
        $subTable = static::getSubTable();
        $sql = "SELECT $mainTable.id FROM $mainTable LEFT JOIN $subTable ON $mainTable.id = $subTable.parentID WHERE $subTable.parentID IS NULL;";
        $db = static::getDB();
        $query = $db->prepare($sql);
        $query->execute();
        $query->bindColumn('id', $id, PDO::PARAM_INT);
        $objects = [];
        while($query->fetch(PDO::FETCH_BOUND)) {
            $objects[] = new static($id);
        }
        return $objects;
    }

    //Abstract static methods
    public abstract static function getSubTable();
}

?>
