<?php

namespace Request;

require_once('Request.php');

//Class to handle requests to remove a record from the DB
class Delete extends Request {
    //Required by Request to process request & generate response str
    protected function process() {
        $class = $this->class;
        //Attempt to remove record & check if there was anything to remove
        if($class::remove($this->data) > 0)
            //Success; there was a record to remove & now it's gone
            return $this->succeed();
        //There was no record with the given id to remove; technically fail
        return $this->fail(
            'INVALID_ID',
            'Given id does not exist in the DB',
            $this->data
        );
    }
}

?>
