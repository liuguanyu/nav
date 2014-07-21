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
                validAct = ["add","edit","get","remove","drag"],
                userInfo = this.assign("user_info"),
                uid = userInfo.uid,
                ugids = userInfo.ugids,
                acts = {
                    add : function (data){
                        if (!data.name || !data.url){
                            return this.error("1001" , "invalid act!" , {});
                        } 

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
                            return {
                                websiteId : websiteId ,
                                uid : uid       
                            };    
                        })

                        .then(function (data){
                            var promise1 = D("User_websites").thenAdd({
                                "uid" : data.uid ,
                                "websites_id" : data.websiteId 
                            } , {
                                "websites_id" : data.websiteId ,                                
                                "uid" : data.uid 
                            }).then(function (data){
                                return data.websites_id;    
                            } , function (){
                                return {};
                            });

                            var promise2 = D("User_websites_order").where({"user_id" : uid}).select().then(function (udata){
                                var id = udata[0].id , 
                                    newId = data.websiteId ,
                                    orders = udata[0].websites_id_order.split(",");

                                if (-1 == orders.indexOf(newId)) {
                                     orders.push(newId) ;
                                }             
                                
                                return D("User_websites_order").where({id : id}).update({"websites_id_order" : orders.join(",")});
                            })    

                            return Promise.all([promise1 , promise2]).then(function (res){
                                return {
                                    id : res[0],
                                    is_protected : 0 // 暂未实现
                                };    
                            } , function (data){
                                console.info(data);
                                return getPromise(-1 , true);
                            })    
                        });   
                    } ,

                    get : function (){
                        return D("User_websites_order").where({"user_id" : uid}).select().then(function (data){
                            if (data.length == 0){ //没有结果,去失败分支
                                return getPromise(0 , true);    
                            }   
                            else{
                                return data;    
                            }
                        }).then(function (data){
                            var wbs = data[0].websites_id_order;

                            //找出当前用户的网址 
                            var promise1 = D("Websites").where("id in (" + wbs + ")").select().then(function (data){
                                return data;
                            } , function (){
                                return [];    
                            });   

                            //找出是本组默认网址的。    
                            var promise2 = D("Ugroup_websites").where("ugid in (" + ugids.join(",") + ")").select().then(function (data){
                                return data;
                            } , function (){
                                return [];    
                            });

                            //别组的默认网址
                            var promise3 = D("Ugroup_websites").where("ugid not in (" + ugids.join(",") + ") and websites_id in (" + wbs + ")").select().then(function (data){
                                return data;
                            } , function (){
                                return [];    
                            })

                            return Promise.all([promise1 , promise2 , promise3]).then(function(res){
                                var wbs0 = res[0] ,
                                    wbs1 = res[1] ,
                                    wbs2 = res[2] , 
                                    node , decide;

                                for(var i in wbs0){
                                    node = wbs0[i];

                                    decide = wbs1.some(function(el){
                                        return node.id == el.websites_id;    
                                    });

                                    if (decide){
                                        wbs0[i].is_protected = 1; //本组网址，不可删，不可改
                                        continue;
                                    }

                                    decide = wbs2.some(function(el){
                                        return node.id == el.websites_id;    
                                    });

                                    if (decide){
                                        wbs0[i].is_protected = 2; //别组网址，可删，不可改
                                        continue;
                                    }
                                } 

                                return wbs0;   
                            } , function (){
                                return [];
                            });   

                        } , function (data){
                            // 组内的默认网址
                            var promise1 = D("Ugroup_websites").where("ugid in (" + ugids.join(",") + ")").select()
                                .then(function (data){
                                    var wbs = [];

                                    data.forEach(function(el){
                                        wbs.push(el.websites_id);
                                    });

                                    return wbs; 
                                })
                                .then(function (data){
                                    return D("Websites").where("id in (" + data.join(",") + ")").select().then(function(data){
                                        return data;
                                    });
                                } , function (){
                                    return [];
                                });

                            // 当前用户的默认网址
                            var promise2 = D("User_websites").where({"user_id" : uid}).select().then(function (data){
                                var wbs = [];

                                data.forEach(function(el){
                                    wbs.push(el.websites_id);
                                });

                                return wbs;
                            }).then(function (data){
                                //我的私有网址
                                var promiseMe = D("Websites").where("id in (" + data.join(",") + ")").select().then(function(data){
                                    return data;
                                } , function (){
                                    return [];
                                });

                                // 这个网址是否是别的组的公共网址
                                var promiseOtherGroup = D("ugroup_websites")
                                    .where("websites_id in (" + data.join(",") + ") and ugid not in (" + ugids.join(",") + ")")
                                    .select()
                                    .then(function(data){
                                       return data;
                                    } , function (){
                                       return []; 
                                });      
                                
                                return Promise.all([promiseMe , promiseOtherGroup]).then(function (res){
                                    var pm = res[0] ,
                                        po = res[1] ;

                                    for(var i in pm){
                                        var node = pm[i] , decide;

                                        decide = po.some(function (el){
                                            return el.websites_id == node.id;
                                        });

                                        if (decide){
                                            pm[i].is_protected = 2;  //是别组网址 ，许删不许改     
                                        }
                                    }
                                    return pm;       
                                });                                 
                            } , function (data){
                                return [];
                            });

                            //消重
                            return Promise.all([promise1 , promise2]).then(function(res){
                                var ret = res[0] ,
                                    retMe = res[1];

                                for(var i in ret){
                                    ret[i].is_protected = 1; //是本组网址，不许删，不许改

                                    for(var j in retMe){
                                        if (ret[i].id == retMe[j].id){
                                            retMe.splice(j , 1);
                                        }
                                    }
                                }

                                var newRet = ret.concat(retMe) , 
                                    idOrder = [];

                                    newRet.forEach(function (el){
                                        idOrder.push(el.id);
                                    });

                                //插入User_websites
                                return D("User_websites_order").thenAdd({
                                    "user_id" : uid,
                                    "websites_id_order" : idOrder.join(",")
                                } , {
                                    "user_id" : uid
                                }).then(function (){
                                    return newRet;
                                })
                            });   
                        });
                    }
                };

            var act = this.get("act"),
                data = this.post("data");

            if (typeof data == "string"){
                data = JSON.parse(data);
            }    

            var isValid = (validAct.indexOf(act) != -1);

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