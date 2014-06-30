<?php

abstract class Filter implements jsonSerializable {
    //Determines if the result should be negated
    protected $negate = false;

    //
    public function __construct($negate = false) {
        $this->negates($negate);
    }

    //Filters have to be able to be invoked
    public function __invoke($track) {
        return $this->filter($track) xor $this->negates();
    }

    //Required by JsonSerializable
    public function jsonSerialize() {
        return [
            'negate' => $this->negates(),
        ];
    }

    //Dual purpose get/set method for $negate
    public function negates($negate = NULL) {
        if($negate === NULL)
            return $this->negate;
        $this->negate = $negate;
    }

    //Serialises the filter (based on it's own jsonSerialize()) with class name
    public function save() {
        return json_encode([
            'class' => get_called_class(),
            'data' => json_encode($this),
        ]);
    }

    //Method to be used by subclasses to perform the actual filtering
    //Should return true on a match, otherwise false
    protected abstract function filter($track);

    //Override this in children to decode their serialised data
    public static function load($json) {
        $json = json_decode($json);
        $ref = new ReflectionClass($json->class);
        $filter = $ref->getMethod('load')->invoke(null, $json->data);
        $filter->negates($json->negate);
        return $filter;
    }
}

?>
