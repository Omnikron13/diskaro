<?php

require_once('Filter.php');

abstract class DataFilter extends Filter {
    protected $data = NULL;
    protected $recursive = false; //Subclass?
    
    public function __construct($data, $recursive = false, $negate = false) {
        parent::__construct($negate);
        $this->setData($data);
        $this->setRecursive($recursive);
    }

    //required by Filter
    protected function filter($track) {
        $checklist = $this->getChecklist($track);
        $data[] = $this->getData();
        if($this->isRecursive())
            $data = array_merge($data, $this->getData()->getChildren(true));
        foreach($data as $d) {
            if(static::check($d, $checklist))
                return true;
        }
        return false;
    }

    //Required by JsonSerializable, inherited from Filter
    public function jsonSerialize() {
        $json = parent::jsonSerialize();
        $json['data'] = $this->getData();
        $json['recursive'] = $this->isRecursive();
        return $json;
    }

    //Getters
    public function getData() {
        return $this->data;
    }
    public function isRecursive() {
        return $this->recursive;
    }

    //Setters
    public function setData($data) {
        $this->data = $data;
    }
    public function setRecursive($recursive) {
        $this->recursive = $recursive;
    }

    //Override Filter::load()
    public static function load($json) {
        $json = json_decode($json);
        return new static(static::loadData($json->data), $json->recursive);
    }

    //Check a single data item against an arbitrary checklist
    // May prove useful for overriding for unusual filters?
    protected static function check($data, $checklist) {
        return in_array($data, $checklist);
    }

    //Should return an array of onjects the same type as $data to be checked.
    // If check is overridden then the type could be different
    protected abstract function getChecklist($track);

    //Should return a new object of the relevant type for $data from the
    // decoded json from load()
    protected abstract static function loadData($data);
}

?>
