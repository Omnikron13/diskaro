<?php

require_once('Filter.php');
require_once('Track.php');

abstract class ListFilter extends Filter {
    protected $list = [];
    protected $recursive = false;

    public function __construct($items, $recursive = false) {
        if(is_array($items))
            $this->list = $items;
        else
            $this->list[] = $items;
        $this->recursive = $recursive;
    }

    public function __invoke($track) {
        foreach($this->getList() as $i) {
            if(static::check($i, $track))
                return static::match();
        }
        return !static::match();
    }
    
    //Required by JsonSerializable, inherited from Filter
    public function jsonSerialize() {
        return [
            'list'      => $this->list,
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

    //Override Filter::load() to unserialise a saved ListFilter
    public static function load($json) {
        $json = json_decode($json);
        return new static(array_map('static::loadItem', $json->list), $json->recursive);
    }
    
    //Should return a 'live' version of a list item from the (decoded) json
    protected abstract static function loadItem($item);

    //Should return an array of items to check the list against
    protected abstract static function getTags($track);

    //Should check a single item in the list and return true for a match, otherwise false
    protected abstract static function check($item, $track);

    //Should return true or false, depending on how the list should respond to matches
    protected abstract static function match();
}

?>
