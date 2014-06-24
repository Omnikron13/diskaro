<?php

require_once('SubDataCore.php');

class Label extends SubDataCore {
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
