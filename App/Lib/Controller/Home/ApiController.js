/**
 * controller
 * @return 
 * 急需重构,放到model
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
                            var websiteId = data.websiteId;

                            var promise1 = D("user_websites").thenAdd({
                                "uid" : data.uid ,
                                "websites_id" : websiteId 
                            } , {
                                "websites_id" : websiteId ,                                
                                "uid" : data.uid 
                            }).then(function (){
                                return websiteId;    
                            } , function (){
                                return {};
                            });

                            var promise2 = D("user_websites_order").where({"user_id" : uid}).select().then(function (udata){
                                var id = udata[0].id , 
                                    newId = data.websiteId ,
                                    orders = (udata[0].websites_id_order == "") 
                                             ? [] 
                                             : udata[0].websites_id_order.split(",");

                                if (-1 == orders.indexOf(newId)) {
                                     orders.push(newId) ;
                                }           
                                
                                return D("user_websites_order").where({id : id}).update({"websites_id_order" : orders.join(",")});
                            });    

                            return Promise.all([promise1 , promise2]).then(function (res){
                                return {
                                    id : res[0],
                                    is_protected : 0 // 暂未实现
                                };    
                            } , function (data){
                                return getPromise(-1 , true);
                            })    
                        });   
                    } ,

                    get : function (){
                        return D("user_websites_order").where({"user_id" : uid}).select().then(function (data){
                            if (data.length == 0){ //没有结果,去失败分支
                                return getPromise(0 , true);    
                            }   
                            else{
                                return data;    
                            }
                        })
                        .then(function (data){
                            var wbs = data[0].websites_id_order;

                            //找出当前用户的网址 
                            var promise1 = D("websites").where("id in (" + wbs + ")").order("find_in_set (id , '" + wbs + "')").select().then(function (data){
                                return data;
                            } , function (){
                                return [];    
                            });   

                            //找出是本组默认网址的。    
                            var promise2 = D("ugroup_websites").where("ugid in (" + ugids.join(",") + ")").select().then(function (data){
                                //return data;
                                var ids = [];

                                data.forEach(function (el){
                                    ids.push(el.websites_id);
                                });

                                return D("websites").where("id in (" + ids.join(",") + ")").select().then(function (data){
                                    return data;
                                } , function (){
                                    return [];
                                })
                            } , function (){
                                return [];    
                            });

                            //别组的默认网址
                            var promise3 = D("ugroup_websites").where("ugid not in (" + ugids.join(",") + ") and websites_id in (" + wbs + ")").select().then(function (data){
                                return data;
                            } , function (){
                                return [];    
                            })

                            return Promise.all([promise1 , promise2 , promise3]).then(function(res){
                                var wbs0 = res[0] , //本人私藏
                                    wbs1 = res[1] , //本组公用
                                    wbs2 = res[2] , //其他组公用
                                    node , decide;

                                /* 先合并别的组的网址 */    
                                wbs0.forEach(function (el , i){
                                    node = wbs0[i];

                                    decide = wbs2.some(function(el2){
                                        return node.id == el2.websites_id;    
                                    });

                                    if (decide){
                                        wbs0[i].is_protected = 2; //别组网址，可删，不可改
                                    }                                    
                                }); 

                                wbs0.forEach(function (el , i){
                                    node = wbs0[i];
                                    //wbs1[i].is_protected = 1 ; //本组网址，不可删，不可改

                                    wbs1.forEach(function(el2 , j){
                                        wbs1[j].is_protected = 1; //本组网址，不可删，不可改

                                        if (node.id == el2.id){
                                            wbs1.splice(j , 1);
                                            wbs0[i].is_protected = 1; //本组网址，不可删，不可改
                                        }    
                                    });
                                });

                                /* 本组默认的放在最后 */
                                wbs0 = wbs0.concat(wbs1);  

                                /*    
                                wbs0.forEach(function (el , i){
                                    node = wbs0[i];

                                    decide = wbs1.some(function(el2){
                                        return node.id == el2.websites_id;    
                                    });

                                    if (decide){
                                        wbs0[i].is_protected = 1; //本组网址，不可删，不可改
                                    }
                                    else{
                                        decide = wbs2.some(function(el2){
                                            return node.id == el2.websites_id;    
                                        });

                                        if (decide){
                                            wbs0[i].is_protected = 2; //别组网址，可删，不可改
                                        }
                                    }
                                }); 
                                */
                                return wbs0;   
                            } , function (){
                                return [];
                            }); 
                        } , function (data){
                            // 组内的默认网址
                            var promise1 = D("ugroup_websites").where("ugid in (" + ugids.join(",") + ")").select()
                                .then(function (data){                                    
                                    var wbs = [];

                                    data.forEach(function(el){
                                        wbs.push(el.websites_id);
                                    });

                                    return wbs; 
                                })
                                .then(function (data){
                                    if (data.length){
                                        return D("websites").where("id in (" + data.join(",") + ")").select().then(function(data){
                                            return data;
                                        });
                                    }
                                    else{
                                        return [];
                                    }
                                } , function (data){
                                    return [];
                                });
                            
                            // 当前用户的默认网址
                            var promise2 = D("user_websites").where({"uid" : uid}).select()

                            .then(function (data){
                                var wbs = [];

                                data.forEach(function(el){
                                    wbs.push(el.websites_id);
                                });
                                return wbs;
                            })

                            .then(function (data){
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

                                    pm.forEach(function (el , i){
                                        var node = pm[i] , decide;

                                        decide = po.some(function (el2){
                                            return el2.websites_id == node.id;
                                        });

                                        if (decide){
                                            pm[i].is_protected = 2;  //是别组网址 ，许删不许改     
                                        }
                                    });
                                    return pm;       
                                });                                 
                            } , function (data){
                                return[];
                            }); 

                            //消重
                            return Promise.all([promise1 , promise2]).then(function(res){    
                                var ret = res[0] ,
                                    retMe = res[1] , newRet , idOrder = [] ;

                                ret.forEach(function (el , i){
                                    ret[i].is_protected = 1; //是本组网址，不许删，不许改

                                    retMe.forEach(function (el2 , j){
                                        if (el.id == el2.id){
                                            retMe.splice(j , 1);
                                        }
                                    });
                                });

                                newRet = ret.concat(retMe);
                                newRet.forEach(function (el){
                                    idOrder.push(el.id);
                                });      

                                //插入User_websites
                                return D("User_websites_order").thenAdd({
                                    "user_id" : uid,
                                    "websites_id_order" : idOrder.join(",")
                                } , {
                                    "user_id" : uid
                                }).then(function (data){ 
                                    return newRet;
                                });
                            }); 
 
                        });
                    },
                    remove : function (data){
                        if (!data.id){
                            return this.error("1001" , "invalid act!" , {});
                        } 

                        var id = data.id;

                        //是否是我的公用网址
                        var promise = D("ugroup_websites").where("websites_id="+id+" and ugid in (" + ugids.join(",") + ")").select(); 

                        var doRemove = function (){
                            var promise1 = D("user_websites").where({"websites_id" : id , "uid" : uid}).delete();
                            var promise2 = D("user_websites_order").where({"user_id" : uid}).select().then(function (data){
                                var websitesIdOrder = data[0].websites_id_order.split(",") , 
                                    uwoid = data[0].id;
                                    idx = websitesIdOrder.indexOf(id);


                                if (-1 != idx){
                                    websitesIdOrder.splice(idx , 1); 
                                } 

                                return D("user_websites_order").where({"id" : uwoid}).update({"websites_id_order" : websitesIdOrder.join(",")}); 
                            })   

                            return Promise.all([promise1 , promise2]).then(function(res){
                                return res;
                            }, function(){
                                return -1;
                            });
                        };

                        return promise.then(function (data){
                            if (0 == data.length){
                                return doRemove();
                            }  
                            else{
                                return getPromise(-1 , true);            
                            }   
                        } , function (){
                            return doRemove();     
                        });
                    },

                    drag : function (data){
                        var newOrder = data.new_order , orderStr;

                        if (newOrder.length == 0){
                            return getPromise(1002 , true) ;  
                        } 

                        orderStr = newOrder.join(",");  

                        return D("user_websites_order").where({user_id : uid}).update({
                            "websites_id_order" : orderStr    
                        });
                    } , 

                    edit : function (data){
                        var id = data.id ,
                            name = data.name ,
                            url = data.url;

                        //先看看是不是这个ID对应这个网址  
                        return D("websites").where({id : id}).select().then(function (cdata){
                            //没取到 
                            if (cdata.length == 0){
                                return getPromise(1007 , true);
                            } 
                            else{
                                var urlOri = cdata[0].url;

                                if (urlOri == url){ //还是这个网址
                                    return getPromise([]);   
                                }
                                else{ //网址不一样了 , 转化为两个请求：1）删除原有网址隶属关系 2）新增网址隶属关系,我擦，这么多嵌套，不改不行啊！
                                    var md5Url = md5(url);

                                    return D("user_websites").select({uid : uid , id : id}).delete().then(function (){
                                        return D("websites").where({url_md5 : md5Url}).select().then(function (nudata){
                                            if (nudata.length == 0){
                                                return getPromise([] , true);
                                            } 
                                            else{
                                                var oldId = id;
                                                id = nudata[0].id; //更新为新ID

                                                //更新websites_order
                                                return D("user_websites_order").where({id : uid}).select().then(function (data){
                                                    if (data.length == 0){
                                                        return getPromise({} , true);
                                                    }    
                                                    else{
                                                        var websitesOrderId = data[0].user_websites_order.split(",") , 
                                                            idx = websitesOrderId.indexOf(oldId); //更新Id

                                                        if (-1 != idx){
                                                            websitesOrderId.splice(idx , 1 , id);
                                                        }    

                                                        return D("user_websites_order").select({id : uid}).update({
                                                            websites_id_order : websitesOrderId.join(",")    
                                                        });
                                                    }    
                                                })
                                            }   
                                        }) 
                                    });   
                                }
                            }   
                        })  
                        .then(function (){    
                            return D("ugroup_websites").where({"websites_id" : id}).select().then(function (uwdata){
                                /* 公共网址不能改 */
                                if (uwdata.length != 0){
                                    return getPromise("1004" , true);
                                }  
                                else{
                                    return getPromise([]);
                                }  
                            } , function (){
                                return getPromise([]);
                            })
                        })

                        .then(function (){
                            /* 别的同学也使用的网址不能改 */
                            return D("user_websites").where("websites_id = " + id + " and uid <> " + uid).select().then(function (oudata){
                                if (oudata.length != 0){
                                    return getPromise("1005" , true);                                    
                                } 
                                else{
                                    return getPromise([]);
                                }    
                            } , function (){
                                return getPromise([]);
                            });   
                        })

                        .then(function (){
                            //看看确实是自己的网址么？
                            return D("user_websites").where({
                                "user_id" : uid ,
                                "websites_id" : id 
                            }).select().then(function (myData){
                                if (myData.length){
                                    return D("websites").where({id : id}).update({
                                        title : name,
                                        url : url
                                    });    
                                }   
                                else{
                                    return getPromise("1006" , true);  
                                } 
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
                self.error(data , "操作失败" , data);  
            });          
        }  
    };
});