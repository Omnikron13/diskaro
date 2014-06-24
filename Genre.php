<?php

require_once('SubDataCore.php');

class Genre extends SubDataCore {
    //Implement abstract methods from DataCore
    public static function getMainTable() {
        return 'genres';
    }
    public static function getSchema() {
        return './sql/genres.sql';
    }
    //Implement abstract methods from SubDataCore
    public static function getSubTable() {
        return 'subGenres';
    }

    //Override nameUnique() from SubDataCore: genre names are unique
    protected static function nameUnique() {
        return true;
    }
}

?>
