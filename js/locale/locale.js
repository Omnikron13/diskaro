//Function to localise/translate strings
function _(str) {
    //Check for localised/translated version of str
    if(typeof _._strings[str] == 'undefined') {
        //No localisation found
        //Uncomment to enable alerting translators of missing strings
        //DEBUG:console.log('No localisation for: ' + str);
        //Return original string unchanged
        return str;
    }
    //Localisation found; return it
    return _._strings[str];
};

//Object to hold key:value pairs of localised/translated strings
_._strings = {};
