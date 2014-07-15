/**
 * controller
 * @return 
 */
module.exports = Controller("Home/BaseController" , function(){
    //"use strict";
    return {
        addwisdomAction: function(){
            var self = this , 
                wisdom = this.post("wisdom" , "") ,
                userInfo = this.assign("user_info"),
                userId = userInfo.uid;

            if (wisdom == ""){
                return this.error("-1" , "参数为空" , {});
            }

            D("Wisdom").add({
                txt : wisdom ,
                user_id : userId
            }).then(function(insertId){
                return self.success(wisdom);
            }).catch(function(err){
                return self.error("-2" , "插入完成" , {});
            });
        }
    };
});