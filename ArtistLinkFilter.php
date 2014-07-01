<?php

require_once('ArtistFilter.php');
require_once('RoleFilter.php');

class ArtistLinkFilter extends ArtistFilter {
    protected $roleFilter = NULL;

    //Override DataFilter constructor to add $roleFilter param
    public function __construct($artist, $roleFilter, $recursive = false, $negate = false) {
        parent::__construct($artist, $recursive, $negate);
        $this->setRoleFilter($roleFilter);
    }

    //Override to serialise role Filter object
    public function jsonSerialize() {
        $json = parent::jsonSerialize();
        $json['roleFilter'] = $this->getRoleFilter()->save();
        return $json;
    }

    //Getters
    public function getRoleFilter() {
        return $this->roleFilter;
    }

    //Setters
    public function setRoleFilter($roleFilter) {
        $this->roleFilter = $roleFilter;
    }

    //Required by DataFilter
    protected function getChecklist($track) {
        return array_map(function($link) {
            return $link->getArtist();
        }, array_filter($track->getArtistLinks(), $this->getRoleFilter()));
    }

    //Override DataFilter::load() to load saved role filter
    public static function load($json) {
        $json = json_decode($json);
        return new static(static::loadData($json->data),
                          Filter::load($json->roleFilter),
                          $json->recursive
        );
    }
}

?>
