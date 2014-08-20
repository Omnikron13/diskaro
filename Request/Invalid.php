<?php

namespace Request;

require_once('Request.php');

//Class to handle requests that are completely invalid
class Invalid extends Request {
    //Holds the original request array; to be passed back in response
    protected $data = null;

    //Construct invalid request object from data array
    public function __construct($data) {
        parent::__construct($data);
        $this->data = $data;
    }

    //Required by Request to process request & generate response str
    protected function process() {
        //Invalid requests always 'fail'
        return $this->fail(
            'INVALID_TYPE',
            'Invalid/Unknown Request type: '.$this->data['type'],
            $this->data['type']
        );
    }
}

?>
