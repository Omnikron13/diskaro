<?php

namespace Request;

require_once('Request.php');

//Require all PHP files in the filter dir to ensure all Filter classes
//are available for the 'filter' constraint
foreach(glob('filter/*.php') as $f) {
    require_once($f);
}

//Class to handle requests to read (JSON) data from the DB
class Get extends Request {
    //type/data pair specifying which data to pull from the DB
    protected $constraint = null;

    //Construct 'get' request object from data array
    public function __construct($data) {
        parent::__construct($data);
        $this->constraint = $data['constraint'];
    }

    //Required by Request to process request & generate response str
    protected function process() {
        $class = $this->class;
        switch($this->constraint['type']) {
            case null:
                return $this->succeed($class::getAll());
            case 'id':
                //Attempt to load record from DB
                $d = new $class($this->constraint['data']);
                //Check if anything loaded (DataCore should really throw to make this cleaner)
                if($d->getID() === null)
                    //Fail if nothing loaded
                    return $this->fail(
                        'INVALID_ID',
                        'Given id does not exist in the DB',
                        $this->constraint['data']
                    );
                //Success; respond with loaded DataCore obj
                return $this->succeed($d);
            case 'filter':
                return $this->succeed(
                    $class::getFiltered(\Filter::load($this->constraint['data']))
                );
            default:
                return $this->fail(
                    'INVALID_CONSTRAINT_TYPE',
                    'Invalid get constraint type: '.$this->constraint['type'],
                    $this->constraint['type']
                );
        }
    }
}

?>
