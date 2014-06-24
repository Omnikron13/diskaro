<?php

require_once('DataCore.php');
require_once('Label.php');

class Release extends DataCore {
    protected $year = NULL;
    protected $label = NULL;

    //Override constructor to convert labelID into Label object
    public function __construct($uid, $mode = 0) {
        parent::__construct($uid, $mode);
        if($this->label != NULL)
            $this->label = new Label($this->label);
        else
            $this->label = NULL;
    }

    //Override constructorBindings from DataCore to add year & label bindings
    protected function constructorBindings($query) {
		$query->bindColumn('year', $this->year, PDO::PARAM_INT);
		$query->bindColumn('labelID', $this->label, PDO::PARAM_INT);
    }

    //Get methods
    public function getYear() {
        return $this->year;
    }
    public function getLabel() {
        return $this->label;
    }

    //Set methods
    public function setYear($year) {
        $this->setField('year', $year, PDO::PARAM_INT);
        $this->year = $year;
    }
    public function setLabel($label) {
        $this->setField('labelID', $label->getID(), PDO::PARAM_INT);
        $this->label = $label;
    }

    //Override jsonSerialize to include year & label
    public function jsonSerialize() {
        $json = parent::jsonSerialize();
        $json['year'] = $this->year;
        if($this->label != NULL)
            $json['label'] = $this->label->jsonSerialize();
        else
            $json['label'] = NULL;
        return $json;
    }

    //Implement abstract static methods from DataCore
    public static function getMainTable() {
        return 'releases';
    }
    public static function getSchema() {
        return './sql/releases.sql';
    }

    //Override add method to allow optional year & label params
    public static function add($name, $year = NULL, $label = NULL) {
        $release = parent::add($name);
        if($year !== NULL)
            $release->setYear($year);
        if($label !== NULL)
            $release->setLabel($label);
        return $release;
    }
}

?>