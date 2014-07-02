<?php

class DB {
    const PATH = 'diskaro.db';

    protected static $db = NULL;

    public static function get() {
		if(self::$db === NULL || !file_exists(static::PATH)) {
			self::$db = new PDO('sqlite:'.self::PATH);
			self::$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			self::$db->exec('PRAGMA foreign_keys = ON');
		}
		return self::$db;
    }

    public static function delete() {
        static::$db = NULL;
        if(file_exists(static::PATH))
            unlink(static::PATH);
    }
}

?>
