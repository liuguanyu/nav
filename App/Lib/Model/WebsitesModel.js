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
        } , 

        addWebsite : function (name , url){
            var dfd = getDefer() ,
                md5Url = md5(url); 

            this.thenAdd({
                "url" : url ,
                "title" : name ,
                "url_md5" : md5Url
            } , {
                "url_md5" : md5Url
            })

            .then(function (websiteId){
                dfd.resolve(websiteId);    
            } , function (){
                dfd.reject([]);
            });        

            return dfd.promise;    
        }
    };
});