<?php

require_once('SubDataCore.php');

class Tag extends SubDataCore {
    //Implement abstract methods from DataCore
    public static function getMainTable() {
        return 'tags';
    }
    public static function getSchema() {
        return './sql/tags.sql';
    }
    //Implement abstract methods from SubDataCore
    public static function getSubTable() {
        return 'subTags';
    }

    //Override nameUnique() from SubDataCore: tag names are unique
    protected static function nameUnique() {
        return true;
    }
}

?>
