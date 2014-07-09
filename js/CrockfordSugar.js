//Method sugar
Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

//Inherits sugar
Function.method('inherits', function(parent) {
    this.prototype = new parent();
    this.prototype.constructor = parent;
    //uber method omitted...
    return this;
});

//Swiss sugar
Function.method('swiss', function(parent) {
    for(var i = 1; i < arguments.length; i++) {
        var name = arguments[i];
        this.prototype[name] = parent.prototype[name];
    }
    return this;
});
