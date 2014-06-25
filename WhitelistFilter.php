<?php

require_once('Track.php');

abstract class WhitelistFilter {
    protected $list = [];
    protected $recursive = false;

    public function __construct($items, $recursive = false) {
        if(is_array($items))
            $this->list = $items;
        else
            $this->list[] = $genre;
        $this->recursive = $recursive;
    }

    public function __invoke($track) {
        foreach($this->getList() as $i) {
            if(in_array($i, static::getTags($track)))
                return true;
        }
        return false;
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

    //Should return an array of items to check the list against
    protected abstract static function getTags($track);
}

?>
