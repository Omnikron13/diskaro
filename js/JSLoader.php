<?php
/*----------------------------------------*
 | Incredibly simple JS dependency loader |
 *---------------------------------------*/

// GZip compression flag
const COMPRESS = false;

// Base for the command regex
const REGEX_TEMPLATE = '/^\/\/(?P<cmd>)\((?P<q>)(?P<src>)(?P=q)\);?$/m';
// Regex for matching valid commands
const REGEX_CMD = 'require(?:_once)?';
// Regex for matching acceptable quote characters
const REGEX_Q   = '[\'"]?';
// Regex for matching acceptable script paths
const REGEX_SRC = '[\w-\/]+\.js';

// Array of previously parsed scripts (for *_once cmds)
$parsed = [];

// Assembles the full regex from the REGEX_* constants
function genRegex($r = REGEX_TEMPLATE) {
    $r = substr_replace($r, REGEX_CMD, strpos($r, '<cmd>') + 5, 0);
    $r = substr_replace($r, REGEX_Q, strpos($r, '<q>') + 3, 0);
    $r = substr_replace($r, REGEX_SRC, strpos($r, '<src>') + 5, 0);
    return $r;
}

// Main parsing function
function parse($file) {
    $js = file_get_contents($file);
    $js = preg_replace_callback(genRegex(), function($m) {
        global $parsed;
        if(substr_count($m['cmd'], 'once') == 0 || !in_array($m['src'], $parsed)) {
            $parsed[] = $m['src'];
            return parse($m['src']);
        }
        return '';
    }, $js);
    return $js;
}

$p = parse(PHP_SAPI=='cli'?$argv[1]:$_GET['src']);

header('Content-Type: application/javascript; charset=utf-8');
if(COMPRESS)
    header('Content-Encoding: gzip');

echo COMPRESS?gzencode($p):$p;

?>
