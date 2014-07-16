define(function (){
    String.prototype.camelize = function() {
        return this.replace(/\-(\w)/ig, function(a, b) {
            return b.toUpperCase();
        });
    };

    String.prototype.stripTags = function() {
        return (this || '').replace(/<[^>]+>/g, '');
    };
});