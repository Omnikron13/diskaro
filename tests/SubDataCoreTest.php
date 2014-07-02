<?php

require_once('SubDataCore.php');

trait SubDataCoreTest {
    /**
     * @depends test_construct
     */
    public function test_addParent($a1) {
        $class = static::getClass();
        //$a1 = new $class(1);
        $a2 = $class::add('A2');
        $a2->addParent($a1);
        //Check db manually
        $db = $class::getDB();
        $pdos = $db->query('SELECT * FROM '.$class::getSubTable().' WHERE id=1;');
        $rows = $pdos->fetchAll(PDO::FETCH_ASSOC);
        $this->assertCount(1, $rows);
        $this->assertEquals(1, $rows[0]['parentID']);
        $this->assertEquals(2, $rows[0]['childID']);
        return $a2;
    }

    /**
     * @depends test_addParent
     */
    public function test_getParents($a2) {
        $class = static::getClass();
        //$a2 = new $class(2);
        $parents = $a2->getParents();
        $this->assertCount(1, $parents);
        $this->assertContainsOnlyInstancesOf($class, $parents);
        $this->assertEquals(1, $parents[0]->getID());
    }

    /**
     * @depends test_addParent
     */
    public function test_getChildren($a2) {
        $class = static::getClass();
        $a1 = new $class(1);
        $children = $a1->getChildren();
        $this->assertCount(1, $children);
        $this->assertContainsOnlyInstancesOf($class, $children);
        $this->assertEquals($children[0], $a2);
        return $a2;
    }

    /**
     * @depends test_getChildren
     */
    public function test_getChildren_recursive($a2) {
        $class = static::getClass();
        $a1 = new $class(1);
        $a3 = $class::add('A3');
        $a3->addParent($a2);
        $children = $a1->getChildren(true);
        $this->assertCount(2, $children);
        $this->assertContainsOnlyInstancesOf($class, $children);
        $this->assertEquals($children[0], $a2);
        $this->assertEquals($children[1], $a3);
    }

    /**
     * @depends test_addParent
     */
    public function test_jsonSerialize_SubDataCore($a2) {
        $json = json_encode($a2);
        $data = json_decode($json);
        $this->assertCount(1, $data->parentIDs);
        $this->assertEquals(1, $data->parentIDs[0]);
    }

    /**
     * @depends test_addParent
     */
    public function test_getLeaves() {
        $class = static::getClass();
        $leaves = $class::getLeaves();
        $this->assertCount(1, $leaves);
        $this->assertContainsOnlyInstancesOf($class, $leaves);
        $this->assertEquals(3, $leaves[0]->getID());
    }
}

?>
