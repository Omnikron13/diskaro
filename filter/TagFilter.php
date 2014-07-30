<?php

require_once('DataFilter.php');

class TagFilter extends DataFilter {
    //Required by DataFilter
    protected function getChecklist($track) {
        return $track->getTags();
    }

    //Required by DataFilter
    protected static function loadData($id) {
        return new Tag($id);
    }
}

?>
