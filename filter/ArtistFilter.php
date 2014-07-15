<?php

require_once('DataFilter.php');

class ArtistFilter extends DataFilter {
    //Required by DataFilter
    protected function getChecklist($track) {
        return $track->getArtists();
    }

    //Required by DataFilter
    protected static function loadData($id) {
        return new Artist($id);
    }
}

?>
