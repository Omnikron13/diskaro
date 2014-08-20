<?php

namespace Request;

require_once('Request.php');

//Class to handle requests to add a new record to the DB
class Add extends Request {
    //JSON str defining new record to add to the DB
    protected $json = null;
    //DataCore object representing newly added DB record
    protected $obj  = null;

    //Construct 'add' request object from data array
    public function __construct($data) {
        parent::__construct($data);
        $this->json = $data['data'];
    }

    //Required by Request to process request & generate response str
    protected function process() {
        $class = $this->class;
        try {
            //Attempt to add new record
            $this->obj = $class::addJSON($this->json);
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
