<?php

require_once('SubDataCore.php');

class Label extends SubDataCore {
    //Get methods
    public function getReleases() {
        $db = static::getDB();
        $query = $db->prepare("SELECT id FROM releases WHERE labelID = :lid;");
        $query->bindParam(':lid', $this->getID(), PDO::PARAM_INT);
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
