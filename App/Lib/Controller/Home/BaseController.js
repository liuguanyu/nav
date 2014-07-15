/* 所有controller的基类 */

module.exports = Controller(function(){
    return {
        __before: function(action){
            var uuap = require("uuap"),
                res = this.http.res ,
                req = this.http.req ,
                self = this ;

            return uuap.getUserInfo(req, res).then(function (userInfo){
                return D("User").thenAdd({
                    "user_name" : userInfo.userName ,
                    "user_mail" : userInfo.userMail ,
                    "display_name" : userInfo.displayName
                } , {
                    user_name: userInfo.userName
                }).then(function(uid){
                    userInfo.uid = uid;
                    self.assign("user_info" , userInfo);
                });
            });
        },

        init: function(http){
            this.super("init", http);
            //this.http = http;

            //给模版里设置title等一些字段
            this.assign({
                title: "便利导航"
            })
        }
    }
})