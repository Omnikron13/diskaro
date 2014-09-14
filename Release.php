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
        if($label != null)
            $this->setField('labelID', $label->getID(), PDO::PARAM_INT);
        else
            $this->setField('labelID', NULL, PDO::PARAM_NULL);
        $this->label = $label;
    }

    //Override jsonSerialize to include year & label
    public function jsonSerialize() {
        $json = parent::jsonSerialize();
        $json['year'] = $this->year;
        //Serialise Label id or null
        $json['labelID'] = $this->label ? $this->label->getID() : NULL;
        return $json;
    }

    //Override DataCore->update() to update year & label
    public function update($data) {
        //Let DataCore perform its updates
        parent::update($data);
        //Update year if different
        if($data->year != $this->getYear())
            $this->setYear($data->year);
        //Convert new label to object (if applicable)
        if($data->labelID != null)
            $label = new Label($data->labelID);
        //Update label if different
        if($label != $this->getLabel())
            $this->setLabel($label);
        return $this;
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

//Set default JSON fields to serialise (year & labelID)
Release::addJsonField('year', function($d) {
    return $d->getYear();
});
Release::addJsonField('labelID', function($d) {
    $l = $d->getLabel();
    return $l ? $l->getID() : null;
});

//Add getReleaseIDs() method to Label - returns array of IDs of Release
//entries in the DB which list this Label with their labelID field
Label::add_method('getReleaseIDs', function() {
    $db = static::getDB();
    $query = $db->prepare("SELECT id FROM releases WHERE labelID = :lid;");
    $query->bindValue(':lid', $this->getID(), PDO::PARAM_INT);
    $query->execute();
    return array_map(function($id) {
        return intval($id, 10);
    }, $query->fetchAll(PDO::FETCH_COLUMN, 0));
});

//Add getReleases() method to Label - returns array of Release objects which
//reference this Label with their labelID field in the DB
Label::add_method('getReleases', function() {
    return array_map(function($id) {
        return new Release($id);
    }, $this->getReleaseIDs());
});

?>
