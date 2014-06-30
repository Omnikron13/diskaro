<?php

require_once('Filter.php');

abstract class DataFilter extends Filter {
    protected $data = NULL;
    protected $recursive = false; //Subclass?
    
    public function __construct($data, $recursive = false) {
        $this->setData($data);
        $this->setRecursive($recursive);
    }

    //required by Filter
    public function __invoke($track) {
        $checklist = static::getChecklist($track);
        $data[] = $this->getData();
        if(!$this->isRecursive())
            $data = array_merge($data, $this->getData()->getChildren(true));
        foreach($data as $d) {
            if(static::check($d, $checklist)
                return true;
        }
        return false;
    }

    //Required by JsonSerializable, inherited from Filter
    public function jsonSerialize() {
        return [
            'data'      => $this->getData(),
            'recursive' => $this->isRecursive(),
        ];
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

    protected static function check($data, $checklist) {
        return in_array($data, $checklist);
    }

    protected abstract static function getChecklist($track);
}

?>
