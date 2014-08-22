<?php

namespace Request;

require_once('Request.php');

//Class to handle requests to add a new record to the DB
class Add extends Request {
    //DataCore object representing newly added DB record
    protected $obj  = null;

    //Required by Request to process request & generate response str
    protected function process() {
        $class = $this->class;
        try {
            //Attempt to add new record
            $this->obj = $class::addJSON($this->data);
            //Success; pass new record back in response
            return $this->succeed($this->obj);
        }
        //Catch DB errors from PDO/SQLite
        catch(\PDOException $e) {
            //Respond with generic DB error
            return $this->fail(
                'DB_ERROR',
                $e->errorInfo[2], //SQLite driver error msg
                $e->errorInfo[1]  //SQLite driver error code
            );
        }
    }
}

?>
