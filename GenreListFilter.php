<?php

require_once('ListFilter.php');

class GenreListFilter extends ListFilter {
    //Required by ListFilter
    protected static function loadItem($item) {
        return new Genre($item->id);
    }
    //Required by ListFilter
    protected static function check($item, $track) {
        return in_array($item, $track->getGenres());
    }
}

?>
