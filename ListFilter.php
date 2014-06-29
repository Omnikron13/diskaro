<?php

require_once('Filter.php');
require_once('Track.php');

abstract class ListFilter extends Filter {
    //Mode Flags
    const WHITELIST = 0b00;
    const BLACKLIST = 0b01;
    const RECURSIVE = 0b10;

    protected $list = [];
    protected $negate = false;
    protected $recursive = false;

    public function __construct($items, $flags = 0) {
        if(is_array($items))
            $this->list = $items;
        else
            $this->list[] = $items;
        $this->negate = $flags&static::BLACKLIST?true:false;
        $this->recursive = $flags&static::RECURSIVE?true:false;
    }

    public function __invoke($track) {
        foreach($this->getList() as $i) {
            if(static::check($i, $track))
                return true xor $this->negate;
        }
        return false xor $this->negate;
    }
    
    //Required by JsonSerializable, inherited from Filter
    public function jsonSerialize() {
        return [
            'list'      => $this->list,
            'negate'    => $this->negate,
            'recursive' => $this->recursive,
        ];
    }

    public function add($item) {
        if(in_array($item, $this->list))
            throw new Exception('Item already in list');
        $this->list[] = $item;
    }

    public function remove($item) {
        unset($this->list[array_search($item, $this->list)]);
        $this->list = array_values($this->list);
    }

    public function getList() {
        if(!$this->recursive)
            return $this->list;
        $list = $this->list;
        foreach($list as $i) {
            $list = array_unique(array_merge($list, $i->getChildren(true)));
        }
        return $list;
    }

    //Basically getRecursive() but this name will probably be clearer
    public function isRecursive() {
        return $this->recursive;
    }

    public function setRecursive($r) {
        $this->recursive = $r;
    }

    //Human-friendly accessors to $negate
    public function isWhitelist() {
        return !$this->negate;
    }
    public function isBlacklist() {
        return $this->negate;
    }

    //Set negate and/or recursive with flags
    public function setMode($flags) {
        $this->negate = $flags&static::BLACKLIST?true:false;
        $this->recursive = $flags&static::RECURSIVE?true:false;
    }

    //Override Filter::load() to unserialise a saved ListFilter
    public static function load($json) {
        $json = json_decode($json);
        $flags = $json->negate?static::BLACKLIST:0;
        $flags |= $json->recursive?static::RECURSIVE:0;
        return new static(array_map('static::loadItem', $json->list), $flags);
    }
    
    //Should return a 'live' version of a list item from the (decoded) json
    protected abstract static function loadItem($item);

    //Should check a single item in the list and return true for a match, otherwise false
    protected abstract static function check($item, $track);
}

?>
