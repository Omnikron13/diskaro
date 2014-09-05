<?php

namespace Request;

require_once('Track.php');
require_once('Get.php');
require_once('Update.php');
require_once('Add.php');
require_once('Delete.php');
require_once('Invalid.php');

//Base class for requests to access/change the DB
abstract class Request {
    //Flag to determine if output should be gzipped
    const COMPRESS = true;

    //Data class/type the Request relates to (eg. Genre, Track, etc.)
    protected $class = null;
    //Extra data expected by specific Request types
    protected $data = null;
    //JSON response string
    protected $response = null;

    //Base constructor
    protected function __construct($data) {
        $this->class = $data['class'];
        $this->data  = $data['data'];
    }

    //Stringify to (possibly compressed) JSON response str
    public function __toString() {
        if(static::COMPRESS)
            return gzencode($this->getResponse());
        return $this->getResponse();
    }

    //Method to get JSON response str, processing request JIT
    public function getResponse() {
        if($this->response === null)
            $this->process();
        return $this->response;
    }

    //Method for type-specific request processing
    protected abstract function process();

    //Method to process request & output JSON response str (with full headers)
    public function output() {
        static::renderOutput($this);
    }

    //Method to generate a failed response string
    protected function fail($code, $message, $data = null) {
        $this->response = static::genFailStr($code, $message, $data);
        return $this;
    }

    //Method to generate a succeeded response string
    protected function succeed($data = null) {
        $this->response = json_encode([
            'success' => true,
            'data'    => $data,
        ]);
        return $this;
    }

    //Factory method to construct appropriate Request obj from array/JSON
    public static function parse($data) {
        //If $data is a str assume it is JSON & decode it
        if(is_string($data))
            $data = json_decode($data, true);
        //Return appropriate class based on type string
        switch($data['type']) {
            case 'get':
                return new Get($data);
            case 'update':
                return new Update($data);
            case 'add':
                return new Add($data);
            case 'delete':
                return new Delete($data);
            default:
                return new Invalid($data);
        }
    }

    //Static method to generate a failure response JSON string
    protected static function genFailStr($code, $message, $data = NULL) {
        return json_encode([
            'success' => false,
            'code'    => $code,
            'message' => $message,
            'data'    => $data,
        ]);
    }

    //Static method to perform actual output
    protected static function renderOutput($response) {
        //Set headers
        header('Content-Type: application/json');
        if(static::COMPRESS)
            header('Content-Encoding: gzip');
        //Output JSON response string
        echo $response;
        //Prevent any further output
        die();
    }
}

?>
