<?php

require_once('DataCore.php');

trait DataCoreTest {
    public function test_setupDB() {
        DB::delete();
        $class = static::getClass();
        $class::setupDB();
        $this->assertFileExists('diskaro.db');
    }

    /**
     * @depends test_setupDB
     */
    public function test_getDB() {
        $class = static::getClass();
        $db = $class::getDB();
        $this->assertInstanceOf('PDO', $db);
    }

    /**
     * @depends test_setupDB
     */
    public function test_add() {
        $class = static::getClass();
        //$class::setupDB();
        $a = $class::add('A');
        $this->assertInstanceOf($class, $a);
    }

    /**
     * @depends test_add
     */
    public function test_construct() {
        $class = static::getClass();
        $a = new $class(1);
        $this->assertInstanceOf($class, $a);
        $this->assertEquals($a->getID(), 1);
        $this->assertEquals($a->getName(), 'A');
        return $a;
    }

    /**
     * @depends test_construct
     */
    public function test_setName($a) {
        $class = static::getClass();
        $a->setName('A1');
        $this->assertEquals($a->getName(), 'A1');
        $a = new $class(1);
        $this->assertEquals($a->getName(), 'A1');
    }

    /**
     * @depends test_construct
     */
    public function test_jsonSerialize_DataCore($a) {
        $class = static::getClass();
        //$a = new $class(1);
        $json = json_encode($a);
        $data = json_decode($json);
        $this->assertEquals($data->id, $a->getID());
        $this->assertEquals($data->name, $a->getName());
        return $data;
    }

    /**
     * @depends test_add
     */
    public function test_getAll() {
        $class = static::getClass();
        $all = $class::getAll();
        $this->assertNotEmpty($all);
        $this->assertContainsOnlyInstancesOf($class, $all);
        $this->assertCount(1, $all);
    }

    /**
     * @depends test_add
     */
    public function test_getFiltered() {
        $class = static::getClass();
        $all = $class::getFiltered(function($x) {
            return true;
        });
        $none = $class::getFiltered(function($x) {
            return false;
        });
        $this->assertNotEmpty($all);
        $this->assertContainsOnlyInstancesOf($class, $all);
        $this->assertCount(1, $all);
        $this->assertEmpty($none);
    }

    //Should return the name of the subclass being tested
    protected abstract static function getClass();
}

?>
