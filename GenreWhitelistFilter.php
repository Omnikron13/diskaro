<?php

require_once('WhitelistFilter.php');

class GenreWhitelistFilter extends WhitelistFilter {
    protected static function getTags($track) {
        return $track->getGenres();
    }
    protected static function loadItem($item) {
        return new Genre($item->id);
    }
}

?>
