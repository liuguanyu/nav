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
        } , 

        addUserWebsites : function (uid , wid){
            var dfd = getDefer();

            this.thenAdd({
                uid : uid ,
                websites_id : wid
            } , {
                uid : uid ,
                websites_id : wid
            }).then(function (insertId){
                dfd.resolve(insertId);     
            } , function (){
                dfd.reject([]);
            });

            return dfd.promise;  

        }

    };
});