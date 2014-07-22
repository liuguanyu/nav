/* 所有controller的基类 */

module.exports = Controller(function(){
    return {
        __before: function(action){
            var uuap = require("uuap"),
                res = this.http.res ,
                req = this.http.req ,
                self = this ,
                userInfoKey = "user_info";

            return uuap.getUserInfo(req, res).then(function (userInfo){
                return D("User").thenAdd({
                    "user_name" : userInfo.userName ,
                    "user_mail" : userInfo.userMail ,
                    "display_name" : userInfo.displayName
                } , {
                    user_name: userInfo.userName
                }).then(function(uid){
                    userInfo.uid = uid;
                    self.assign(userInfoKey , userInfo);
                }).then(function (data){
                    var userInfo = self.assign(userInfoKey), 
                        uid = userInfo.uid;

                    return D("User_ugroup").where({"user_id" : uid}).select().then(function (data){
                        var ugids = [];

                        data.forEach(function (el){
                            ugids.push(el.ugid);
                        });

                        if (ugids.length == 0 ){
                            ugids = [0]; //默认组
                        }

                        userInfo.ugids = ugids;

                        self.assign(userInfoKey , userInfo);
                    });
                });
            });
        },

        init: function(http){
            this.super("init", http);
            //this.http = http;

            //给模版里设置title等一些字段
            this.assign({
                title: "内部导航"
            })
        }
    }
})