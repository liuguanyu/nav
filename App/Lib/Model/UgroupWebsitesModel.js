'use strict';

module.exports = Model(function() {
    return {
        getWebsitesOrderByUgids : function (ugids , websitesIds){
            var dfd = getDefer() , conds = {};

            if (ugids.length == 0){
                dfd.reject([]);  
            }
            else{
                conds["ugid"] = ["in" , ugids] ;
                if (websitesIds){
                    conds["websites_id"] = ["in" , websitesIds];
                }
                this.where(conds).select().then(function (data){
                    dfd.resolve(data);
                } , function (){
                    dfd.reject([]);
                });
            }

            return dfd.promise;
        } ,

        getOtherGroupWebsites : function (ugids , websiteIds){
            var dfd = getDefer();  
            
            if (ugids.length == 0 || websiteIds.length == 0){
                dfd.reject([]);  
            }
            else{
                this.where({
                    "ugid" : ["not in" , ugids] ,
                    "websites_id" : ["in" , websiteIds]
                }).select().then(function (data){
                    dfd.resolve(data);
                } , function (){
                    dfd.reject([]);
                });
            }

            return dfd.promise;                         
        }
    };
});