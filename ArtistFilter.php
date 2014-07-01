<?php

require_once('DataFilter.php');

class ArtistFilter extends DataFilter {
    //Required by DataFilter
    protected static function getChecklist($track) {
        //Merges Track->artist with Artist objects extracted from the
        // ArtistLink objects from Track->artists[] - this should perhaps
        // be switchable behaviour, or delegated to Track (or even the
        // distinction removed entirely from Track...)
        return array_merge([$track->getArtist()], array_map(function($link) {
            return $link->getArtist();
        }, $track->getArtists()));
    }

    //Required by DataFilter
    protected static function loadData($data) {
        return new Artist($data->id);
    }
}

?>
