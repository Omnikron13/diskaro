/*--------------------------*
 | Array class enhancements |
 *--------------------------*/

//Add missing difference method
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};
