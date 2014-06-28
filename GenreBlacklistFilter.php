<?php

require_once('BlacklistFilter.php');

class GenreBlacklistFilter extends BlacklistFilter {
    protected static function getTags($track) {
        return $track->getGenres();
    }
}

?>
