/**
 * controller
 * @return 
 */
module.exports = Controller("Home/BaseController" , function(){
    "use strict";
    return {
        indexAction: function(){
            var self = this ,
                userInfo = self.assign("user_info"),                 
                promise1 = D('Wisdom').field('txt').order("RAND()").limit(1).select().then(function (data){
                    return data;
                } , function (error){
                    return [];
                }),
                promise2 = getPromise({
                    uid : userInfo.uid
                }).then(function(data){
                    return D("User_ugroup").where({user_id : data.uid}).select()
                }).then(function(data){
                    var ugids = [];

                    data.forEach(function (el){
                        ugids.push(el.ugid) ;    
                    });

                    if (ugids.length){
                        return D("ugroup_websites").where("ugid in (" + ugids.join(",") + ")").select();
                    }
                    else{
                        return getPromise({} , true);
                    }    
                }).then(function (data){
                    var websites = [];

                    data.forEach(function (el){
                        websites.push(el.websites_id) ;    
                    });

                    if (websites.length){
                        return D("websites").where("id in (" + websites.join(",") + ")").select();
                    }
                    else{
                        return getPromise({} , true);
                    }    
                }).then(function (data){
                    return data;
                } , function (){
                    return [];
                });   

            Promise.all([promise1 , promise2]).then(function (res){
                self.assign("wisdom" , res[0]);
                self.assign("websites" , res[1]);

                self.display();
            });       
        }
    };
});

