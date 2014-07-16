<?php

require_once('DataFilter.php');

class RoleFilter extends DataFilter {
    //Required by DataFilter
    protected function getChecklist($link) {
        return [$link->getRole()];
    }

    //Required by DataFilter
    protected static function loadData($id) {
        return new Role($id);
    }
}

?>