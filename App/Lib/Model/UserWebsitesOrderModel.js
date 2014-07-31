'use strict';

module.exports = Model(function() {
    return {
        getWebsitesOrderByUid : function (uid){
            var dfd = getDefer();

            this.where({"user_id" : uid}).select().then(function (data){
                if (data.length){
                    var websitesIdOrder = data[0].websites_id_order;

                    dfd.resolve(arrayUnique(websitesIdOrder.split(",")));
                }
                else{
                    dfd.reject([]);    
                }
            } , function (){
                dfd.reject([]);
            });

            return dfd.promise;
        } , 

        insert : function (uid , websitesIdOrder){
            return D("User_websites_order").thenAdd({
                "user_id" : uid,
                "websites_id_order" : arrayUnique(websitesIdOrder).join(",") 
            } , {
                "user_id" : uid
            })
        } ,

        updateWebsitesOrder : function (uid , wid){
            var dfd = getDefer() , self = this;

            this.getWebsitesOrderByUid(uid).then(function (websitesIdOrders){
                if (-1 == websitesIdOrders.indexOf(wid)) {
                    websitesIdOrders.push(wid) ;
                }  

                websitesIdOrders = arrayUnique(websitesIdOrders);

                self.where({"user_id" : uid})
                    .update({"websites_id_order" : websitesIdOrders.join(",")})
                    .then(function (data){
                        dfd.resolve(websitesIdOrders);
                    } , function (){
                        dfd.reject({});
                    });
            } , function (data){
                dfd.reject([]);
            });

            return dfd.promise;
        }
    };
});