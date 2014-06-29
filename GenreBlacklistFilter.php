<?php

require_once('BlacklistFilter.php');

class GenreBlacklistFilter extends BlacklistFilter {
    protected static function getTags($track) {
        return $track->getGenres();
    }
    protected static function loadItem($item) {
        return new Genre($item->id);
    }
}

?>
