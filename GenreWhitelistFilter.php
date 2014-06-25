<?php

require_once('WhitelistFilter.php');

class GenreWhitelistFilter extends WhitelistFilter {
    protected static function getTags($track) {
        return $track->getGenres();
    }
}

?>
