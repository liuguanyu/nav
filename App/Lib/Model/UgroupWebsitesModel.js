'use strict';

module.exports = Model(function() {
    return {
        getWebsitesOrderByUgids : function (ugids){
            var dfd = getDefer();

            if (ugids.length == 0){
                dfd.reject([]);  
            }
            else{
                this.where({"ugid" : ["in" , ugids]}).select().then(function (data){
                    dfd.resolve(data);
                } , function (){
                    dfd.reject([]);
                });
            }

            return dfd.promise;
        } ,

        getOtherGroupWebsites : function (ugids , websites){
            var dfd = getDefer();  
            
            if (ugids.length == 0 || websites.length == 0){
                dfd.reject([]);  
            }
            else{
                this.where({
                    "ugid" : ["not in" , ugids] ,
                    "websites_id" : ["in" , websites]
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