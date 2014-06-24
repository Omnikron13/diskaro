<?php

require_once('SubDataCore.php');

class Artist extends SubDataCore {
    //Implement abstract methods from DataCore
    public static function getMainTable() {
        return 'artists';
    }
    public static function getSchema() {
        return './sql/artists.sql';
    }
    //Implement abstract methods from SubDataCore
    public static function getSubTable() {
        return 'artistPseudonyms';
    }
}

?>
