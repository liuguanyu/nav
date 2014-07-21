/**
 * controller
 * @return 
 */
module.exports = Controller("Home/BaseController" , function(){
    "use strict";
    return {
        indexAction: function(){
            var self = this ,
                userInfo = self.assign("user_info");

            return D('Wisdom').field('txt').order("RAND()").limit(1).select().then(function (data){
                self.assign("wisdom" , data);

                self.display();
            } , function (error){
                return [];
            });     
        }
    };
});

