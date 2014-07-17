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
        }, 

        urlAction : function (){
            var self = this ,
                validAct = ["add","edit","remove","drag"],
                uid = this.assign("user_info").uid,
                acts = {
                    add : function (data){
                        var name = data.name ,
                            url  = data.url ,
                            myMd5  = md5(url);

                        return D("Websites").thenAdd({
                            "url" : url ,
                            "title" : name ,
                            "url_md5" : myMd5
                        } , {
                            "url_md5" : myMd5
                        })

                        .then(function (websiteId){
                            return getPromise({
                                websiteId : websiteId ,
                                uid : uid       
                            });    
                        })

                        .then(function (data){
                            var promise = D("User_websites").thenAdd({
                                "uid" : data.uid ,
                                "websites_id" : data.websiteId 
                            } , {
                                "websites_id" : data.websiteId ,                                
                                "uid" : data.uid 
                            })

                            return promise.then(function (){
                                return data.websiteId;
                            } , function (){
                                return -1;
                            })    
                        });   
                    } 
                };

            var act = this.get("act"),
                data = this.post("data");

            if (typeof data == "string"){
                data = JSON.parse(data);
            }    

            var isValid = (validAct.indexOf(act) != -1);

            isValid = isValid && data.name && data.url ;

            if (!isValid){
                return this.error("1001" , "invalid act!" , {});
            }

            acts[act].call(this , data).then(function(data){
                self.success(data);
            } , function (data){
                self.error(1001 , "操作失败" , data);  
            });          
        }  
    };
});