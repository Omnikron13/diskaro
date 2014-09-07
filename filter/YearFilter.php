<?php

require_once('Filter.php');

class YearFilter extends Filter {
    //Lowest/highest allowed years
    const YEAR_MIN = 1;
    const YEAR_MAX = 9999;

    //Min/max year (inclusive) to match
    protected $start = NULL;
    protected $end   = NULL;

    //Construct from start year & (optional) end year (inclusive)
    public function __construct($start, $end = NULL, $negate = false) {
        parent::__construct($negate);
        $this->setStart($start);
        $this->setEnd($end);
    }

    //Setter for min/start year
    public function setStart($year) {
        //Throw if given year isn't considered valid
        if(!static::validYear($year))
            throw new RangeException("Start year ($year) out out range");
        $this->start = $year;
        return $this;
    }

    //Setter for max/end year
    public function setEnd($year) {
        //Nothing to do if given year is null(ish)
        if(!$year) return $this;
        //Throw if given year isn't considered valid
        if(!static::validYear($year))
            throw new RangeException("End year ($year) out out range");
        //Throw if given year is (chronologically) before start year
        if($year < $this->start)
            throw new RangeException("End year ($year) is before start year ($this->start)");
        $this->end = $year;
        return $this;
    }

    //Override Filter->jsonSerialize() to serialize the year(s)
    public function jsonSerialize() {
        $json = parent::jsonSerialize();
        $json['start'] = $this->start;
        $json['end']   = $this->end;
        return $json;
    }

    //Required by Filter
    protected function filter($track) {
        //Get Track's Release year
        $y = $track->getYear();
        //Always filter out on NULL release/year
        if(!$y) return false;
        //No end year is set; check for exact match
        if(!$this->end) return $y == $this->start;
        //Check if year is within range (inclusive)
        return !($y < $this->start || $y > $this->end);
    }

    //Function to check if a given year is considered valid
    protected static function validYear($year) {
        if($year < static::YEAR_MIN || $year > static::YEAR_MAX)
            return false;
        return true;
    }

    //Override Filter to load the years 
    public static function load($json) {
        $json = json_decode($json);
        return new static($json->start, $json->end);
    }
}

?>
