'use strict';

module.exports = Model(function() {
    return {
        getWebsitesByIds : function (ids){
            var dfd = getDefer() , idStr = ids.join(",");

            this.where({"id" : ["in" , ids]})
                .order("find_in_set (id , '" + idStr + "')")
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