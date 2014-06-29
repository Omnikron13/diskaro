<?php

require_once('Filter.php');

class CompoundFilter extends Filter {
    //Canonical operator names
    const OP_AND = 'AND';
    const OP_OR  = 'OR';
    const OP_XOR = 'XOR';

    protected $left = NULL;
    protected $right = NULL;
    protected $operator = NULL;

    //left & right should be Filter objects, operator should be one of the
    // operators that setOperator() can parse
    public function __construct($left, $right, $operator) {
        $this->left = $left;
        $this->right = $right;
        $this->setOperator($operator);
    }

    //Required by Filter
    public function __invoke($track) {
        $left = $this->left;
        $right = $this->right;
        switch($this->operator) {
            case static::OP_AND:
                return $left($track) && $right($track);
                break;
            case static::OP_OR:
                return $left($track) || $right($track);
                break;
            case static::OP_XOR:
                return $left($track) xor $right($track);
                break;
        }
    }

    //Required by JsonSerializable, inherited from Filter
    public function jsonSerialize() {
        return [
            'operator' => $this->operator,
            'left'     => $this->left->save(),
            'right'    => $this->right->save(),
        ];
    }

    //Getters
    public function getLeft() {
        return $this->left;
    }
    public function getRight() {
        return $this->right;
    }
    public function getOperator() {
        return $this->operator;
    }

    //Setters
    public function setLeft($left) {
        $this->left = $left;
    }
    public function setRight($right) {
        $this->right = $right;
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

    //Override from Filter
    public static function load($json) {
        $json = json_decode($json);
        return new static(Filter::load($json->left), Filter::load($json->right), $json->operator);
    }
}

?>
