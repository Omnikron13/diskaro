<?php

require_once('DataFilter.php');

class ArtistFilter extends DataFilter {
    //Required by DataFilter
    protected static function getChecklist($track) {
        return $track->getArtists();
    }

    //Required by DataFilter
    protected static function loadData($data) {
        return new Artist($data->id);
    }
}

?>
