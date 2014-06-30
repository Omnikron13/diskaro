<?php

require_once('Filter.php');

class CompoundFilter extends Filter {
    //Canonical operator names
    const OP_AND = 'AND';
    const OP_OR  = 'OR';
    const OP_XOR = 'XOR';

    //Array of arbitrary Filter objects
    protected $filters = [];

    public function __construct($filters, $operator, $negate = false) {
        parent::__construct($negate);
        $this->setFilters($filters);
        $this->setOperator($operator);
    }

    //Required by Filter
    //Delegate to relevant opX() method based on $operator
    // Could perhaps be more extensible by constructing the relevant method
    // name from the operator string so a subclass wouldn't need to override?
    protected function filter($track) {
        switch($this->getOperator()) {
            case static::OP_AND:
                return $this->opAnd($track);
            case static::OP_OR:
                return $this->opOr($track);
            case static::OP_XOR:
                return $this->opXor($track);
        }
    }

    //Required by JsonSerializable, inherited from Filter
    public function jsonSerialize() {
        return [
            'operator' => $this->getOperator(),
            'filters'  => array_map(function($filter) {
                return $filter->save();
            }, $this->getFilters()),
        ];
    }

    //Getters
    public function getFilters() {
        return $this->filters;
    }
    public function getOperator() {
        return $this->operator;
    }

    //Setters
    public function setFilters($filters) {
        $this->filters = is_array($filters)?$filters:[$filters];
    }

    //Parse various possible names of each operator to canonical ones
    public function setOperator($operator) {
        switch(strtoupper($operator)) {
            case 'K':case '&':case '&&':case 'AND':
            case static::OP_AND:
                $this->operator = static::OP_AND;
                break;
            case 'A':case '|':case '||':case 'OR':
            case static::OP_OR:
                $this->operator = static::OP_OR;
                break;
            case 'J':case 'EOR':case 'EXOR':case 'XOR':
            case static::OP_XOR:
                $this->operator = static::OP_XOR;
                break;
        }
    }

    //Add new filter to the array, throwing an exception if non-unique
    public function addFilter($filter) {
        if(in_array($filter, $this->getFilters()))
            throw new Exception('Filter already in list');
        $this->filters[] = $filter;
    }

    //Remove given filter from the array, has no effect and throws no
    // exception (currently) if the filter isn't in the array
    public function removeFilter($filter) {
        unset($this->filters[array_search($filter, $this->filters)]);
        $this->filters = array_values($this->filters);
    }

    //Check if /all/ filters match $track
    protected function opAnd($track) {
        foreach($this->getFilters() as $filter) {
            if(!$filter($track))
                return false;
        }
        return true;
    }

    //Check if /any/ filters match $track
    protected function opOr($track) {
        foreach($this->getFilters() as $filter) {
            if($filter($track))
                return true;
        }
        return false;
    }

    //Check if /one-and-only-one/ filter matches $track
    protected function opXor($track) {
        $matches = 0;
        foreach($this->getFilters() as $filter) {
            if($filter($track))
                $matches++;
            if($matches > 1)
                return false;
        }
        return $matches==1?:false;
    }

    //Override Filter::load() to unserialise all filters & operator
    public static function load($json) {
        $json = json_decode($json);
        return new static(array_map(Filter::load($json), $json->filters), $json->operator);
    }
}

?>
