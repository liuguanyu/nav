'use strict';

module.exports = Model(function() {
    return {
        getWebsitesByUid : function (uid){
            var dfd = getDefer();

            this.where({"uid" : uid})
                .select()
                .then(function (data){
                   dfd.resolve(data);
                } , function (data){
                   dfd.reject([]);
                });

            return dfd.promise;     
        }
    };
});