<?php

require_once('DataFilter.php');

class GenreFilter extends DataFilter {
    //Required by DataFilter
    protected static function getChecklist($track) {
        return $track->getGenres();
    }

    //Required by DataFilter
    protected static function loadData($data) {
        return new Genre($data->id);
    }
}

?>
