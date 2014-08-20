<?php

namespace Request;

require_once('Request.php');

//Class to handle requests to update a record in the DB
class Update extends Request {
    //JSON str defining new state of the DB record being updated
    protected $json = null;

    //Construct 'update' request object from data array
    public function __construct($data) {
        parent::__construct($data);
        $this->json = $data['data'];
    }

    //Required by Request to process request & generate response str
    protected function process() {
        //Convert supplied JSON str to generic object
        $data = json_decode($this->json);
        //Load object representing DB record to update
        $target = new $this->class($data->id);
        //Check if anything loaded (DataCore should really throw to make this cleaner)
        if($target->getID() === null)
            //Fail if nothing loaded
            return $this->fail(
                'INVALID_ID',
                'Given id does not exist in the DB',
                $data->id
            );
        //Apply updates
        $target->update($data);
        //Success
        return $this->succeed($target);
    }
}

?>
