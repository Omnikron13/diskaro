<?php

abstract class Filter implements jsonSerializable {
    //Filters have to be able to be invoked
    public abstract function __invoke($track);

    //Serialises the filter (based on it's own jsonSerialize()) with class name
    public function save() {
        return json_encode([
            'class' => get_called_class(),
            'data' => json_encode($this),
        ]);
    }

    //Override this in children to decode their serialised data
    public static function load($json) {
        $json = json_decode($json);
        $ref = new ReflectionClass($json->class);
        return $ref->getMethod('load')->invoke(null, $json->data);
    }
}

?>
