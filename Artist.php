<?php

require_once('DataCore.php');

class Artist extends DataCore {
    //Implement abstract methods from DataCore
    public static function getMainTable() {
        return 'artists';
    }
    public static function getSchema() {
        return './sql/artists.sql';
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
}

?>
