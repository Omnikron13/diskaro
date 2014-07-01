<?php

require_once('DataFilter.php');

class ReleaseFilter extends DataFilter {
    //Override DataFilter->setRecursive() to throw if you try to make a
    // recursive ReleaseFilter (or set one to recursive)
    public function setRecursive($recursive) {
        if($recursive)
            throw new Exception('A ReleaseFilter cannot be recursive');
    }

    //Required by DataFilter
    protected static function getChecklist($track) {
        return [$track->getRelease()];
    }

    //Required by DataFilter
    protected static function loadData($data) {
        return new Release($data->id);
    }
}

?>
