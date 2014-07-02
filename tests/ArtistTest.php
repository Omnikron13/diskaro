<?php

require_once('DataCoreTest.php');
require_once('SubDataCoreTest.php');
require_once('Artist.php');

class ArtistTest extends PHPUnit_Framework_TestCase {
    use DataCoreTest;
    use SubDataCoreTest;

    protected static function getClass() {
        return 'Artist';
    }
}


?>
