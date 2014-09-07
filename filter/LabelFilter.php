<?php

require_once('DataFilter.php');

class LabelFilter extends DataFilter {
    //Required by DataFilter
    protected function getChecklist($track) {
        return [$track->getLabel()];
    }

    //Required by DataFilter
    protected static function loadData($id) {
        return new Label($id);
    }
}

?>
