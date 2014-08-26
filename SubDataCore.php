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

    //Method to remove parent link from the DB
    public function removeParent($parent) {
        //Fail if link doesn't exist (would fail silently anyway, which might be better?)
        if(!in_array($parent, $this->getParents()))
            throw new Exception('Cannot remove parent'); //Should be custom
        //Remove DB record
        $db = static::getDB();
        $query = $db->prepare('DELETE FROM '.static::getSubTable().' WHERE parentID=:pid AND childID=:cid;');
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
        return array_map('intval', $query->fetchAll(PDO::FETCH_COLUMN, 0));
    }

    //Method to add child link to the DB
    public function addChild($child) {
        //Delegate to child's addParent() logic
        $child->addParent($this);
    }

    //Method to remove child link from the DB
    public function removeChild($child) {
        //Delegate to child's removeParent() logic
        $child->removeParent($this);
    }

    public function getChildren($recursive = false) {
        $children = array_map(function($cid) {
            return new static($cid);
        }, $this->getChildIDs());
        if(!$recursive)
            return $children;
        foreach($children as $c) {
            $children = array_unique(array_merge($children, $c->getChildren(true)));
        }
        return $children;
    }

    protected function getChildIDs() {
        $db = static::getDB();
        $query = $db->prepare('SELECT childID FROM '.static::getSubTable().' WHERE parentID=:pid;');
        $query->bindParam(':pid', $this->getID(), PDO::PARAM_INT);
        $query->execute();
        return array_map('intval', $query->fetchAll(PDO::FETCH_COLUMN, 0));
    }

    //Override jsonSerialize to include parent/child IDs (should perhaps
    // [optionally] be parents/children objects?
    public function jsonSerialize() {
        $json = parent::jsonSerialize();
        $json['parentIDs'] = $this->getParentIDs();
        $json['childIDs'] = $this->getChildIDs();
        return $json;
    }

    //Override DataCore->update() to add/remove parents/children
    public function update($data) {
        //Let DataCore perform its updates
        parent::update($data);
        //Convert new parent IDs into objects
        $newParents = array_map(function($pid) {
            return new static($pid);
        }, $data->parentIDs);
        //Get old parent objects
        $oldParents = $this->getParents();
        //Add parents
        foreach(array_diff($newParents, $oldParents) as $p) {
            $this->addParent($p);
        }
        //Remove parents
        foreach(array_diff($oldParents, $newParents) as $p) {
            $this->removeParent($p);
        }
        //Convert new child IDs into objects
        $newChildren = array_map(function($cid) {
            return new static($cid);
        }, $data->childIDs);
        //Get old child objects
        $oldChildren = $this->getChildren();
        //Add children
        foreach(array_diff($newChildren, $oldChildren) as $c) {
            $this->addChild($c);
        }
        //Remove children
        foreach(array_diff($oldChildren, $newChildren) as $c) {
            $this->removeChild($c);
        }
        return $this;
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
