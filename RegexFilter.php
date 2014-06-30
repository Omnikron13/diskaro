<?php

require_once('Filter.php');

class RegexFilter extends Filter {
    protected $regex = NULL;

    //
    public function __construct($regex, $negate = false) {
        parent::__construct($negate);
        $this->setRegex($regex);
    }

    //Required by Filter
    protected function filter($track) {
        $match = preg_match($this->getRegex(), $track->getName());
        if($match === FALSE)
            throw new Exception('Regex error');
        return $match==1?:false;
    }

    //Override Filter->jsonSerialize() to serialize the regex
    public function jsonSerialize() {
        $json = parent::jsonSerialize();
        $json['regex'] = $this->getRegex();
        return $json;
    }

    //Getters
    public function getRegex() {
        return $this->regex;
    }

    //Setters
    public function setRegex($regex) {
        $this->regex = $regex;
    }

    //Override Filter to load the regex
    public static function load($json) {
        $json = json_decode($json);
        return new static($json->regex);
    }
}

?>
