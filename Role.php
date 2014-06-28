<?php

require_once('SubDataCore.php');

class Role extends SubDataCore {
    //Implement abstract methods from DataCore
    public static function getMainTable() {
        return 'roles';
    }
    public static function getSchema() {
        return './sql/roles.sql';
    }
    //Implement abstract methods from SubDataCore
    public static function getSubTable() {
        return 'subRoles';
    }

    //Override nameUnique() from SubDataCore: role names are unique
    protected static function nameUnique() {
        return true;
    }
}

?>
