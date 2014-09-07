<?php

require_once('SubDataCore.php');

class Label extends SubDataCore {
    //Get methods
    public function getReleases() {
        $db = static::getDB();
        $query = $db->prepare("SELECT id FROM releases WHERE labelID = :lid;");
        $query->bindValue(':lid', $this->getID(), PDO::PARAM_INT);
        $query->execute();
        return array_map(function($id) {
            return new Release($id);
        }, $query->fetchAll(PDO::FETCH_COLUMN, 0));
    }

    //Override jsonSerialize to include releaseIDs
    public function jsonSerialize() {
        $json = parent::jsonSerialize();
        $json['releaseIDs'] = array_map(function($r) {
            return $r->getID();
        }, $this->getReleases());
        return $json;
    }

    //Override DataCore->update() to update referencing Releases
    public function update($data) {
        //Let DataCore perform its updates
        parent::update($data);
        //Convert new releaseIDs to Release objects
        $newReleases = array_map(function($rid) {
            return new Release($rid);
        }, $data->releaseIDs);
        //Get current/old Release object array
        $oldReleases = $this->getReleases();
        //Iterate Releases to add to this Label
        foreach(array_diff($oldReleases, $newReleases) as $r) {
            $r->setLabel(null);
        }
        //Iterate Releases to remove from this Label
        foreach(array_diff($newReleases, $oldReleases) as $r) {
            $r->setLabel($this);
        }
        return $this;
    }

    //Implement abstract static methods from DataCore
    public static function getMainTable() {
        return 'labels';
    }
    public static function getSchema() {
        return './sql/labels.sql';
    }
    //Implement abstract static methods from SubDataCore
    public static function getSubTable() {
        return 'subLabels';
    }
}

?>
