<?php
 
//Trait to enable adding new methods to existing classes
trait TAddMethod {
    //Array to hold new method Closures
    protected static $added_methods = [];
 
    //Process attempts to call functions the class doesn't have
    public function __call($name, $args) {
        $method = $this->get_method($name);
        if(!$method)
            throw new BadMethodCallException(get_called_class()." does not have method: $name");
        return call_user_func_array($method, $args);
    }

    //Returns added method with given name (or null if not found)
    public function get_method($name) {
        $methods = static::get_methods(true);
        return array_key_exists($name, $methods) ?
            $methods[$name]->bindTo($this, $this) : null;
    }

    //Returns true if class has given method (defined, inheritted or added)
    public static function has_method($name) {
        return
            method_exists(get_called_class(), $name) ||
            array_key_exists($name, static::get_methods(true))
        ;
    }

    //Adds a new method to the class
    public static function add_method($name, $closure) {
        static::$added_methods[get_called_class()][$name] = $closure;
    }

    //Returns array of methods which have been added to the class, optionally
    //merged with methods which have been added to parent/grandparent/etc.
    public static function get_methods($recurse = false) {
        $class  = get_called_class();
        $methods = [];
        if($recurse) {
            $parent = get_parent_class($class);
            if($parent) $methods = array_merge($methods, $parent::get_methods(true));
        }
        if(array_key_exists($class, static::$added_methods))
            $methods = array_merge($methods, static::$added_methods[$class]);
        return $methods;
    }
}
 
?>
