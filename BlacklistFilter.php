<?php

require_once('ListFilter.php');

abstract class BlacklistFilter extends ListFilter {
    protected static function check($item, $track) {
        return in_array($item, static::getTags($track));
    }
    protected static function match() {
        return false;
    }
}

?>
