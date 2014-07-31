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

                        return D("Websites").addWebsite(data.name , data.url)   
                        .then(function (websiteId){
                            //插入用户、网址表
                            var promise1 = D("UserWebsites").addUserWebsites(uid , websiteId);

                            //更新顺序表            
                            var promise2 = D("UserWebsitesOrder").updateWebsitesOrder(uid , websiteId);

                            //是否别组公共
                            var promise3 = D("UgroupWebsites").getOtherGroupWebsites(ugids , [websiteId]);

                            return Promise.all([promise1 , promise2 , promise3]).then(function (res){
                                var isProtected = (res[2].length == 0) 
                                        ? 0 
                                        : 2 ;
                                return {
                                    id : websiteId , 
                                    is_protected : isProtected
                                }        
                            } , function (data){
                                return getPromise(-1 , true);
                            })    
                        });   
                    } ,

                    get : function (){   
                        var promiseGroup = D("UgroupWebsites").getWebsitesOrderByUgids(ugids).then(function (data){
                                return D("Websites").getWebsitesByIds(getFieldFromArray(data , "websites_id"));     
                            } , function (){
                                return [];
                            }); 


                        return D("UserWebsitesOrder").getWebsitesOrderByUid(uid)
                        .then(function (webids){
                            //找出当前用户的网址 
                            var promise1 = D("Websites").getWebsitesByIds(webids);   

                            //别组的默认网址
                            var promise2 = D("UgroupWebsites").getOtherGroupWebsites(ugids , webids);

                            return Promise.all([promise1 , promiseGroup , promise2]).then(function(res){
                                var wbs0 = res[0] , //本人私藏
                                    wbs1 = res[1] , //本组公用
                                    wbs2 = res[2] , //其他组公用
                                    node , decide;

                                // 标记其他组
                                markEqualArray(wbs0 , wbs2 , function (el1 , el2){
                                    return el1.id == el2.websites_id;
                                } , function (arr , idx){
                                    arr[idx].is_protected = 2 ; //别组网址，可删，不可改
                                });

                                wbs1.forEach(function (el , i){
                                    wbs1[i].is_protected = 1; //本组网址，不可删，不可改   
                                });

                                //合并本人、本组
                                wbs0 = combineArray(wbs0 , wbs1 , function (el1 , el2){
                                    return el1.id == el2.id;   
                                } , function (arr , idx){                                  
                                    arr[idx].is_protected = 1 ;   //本组网址，不可删，不可改 
                                });
                            
                                return wbs0;   
                            } , function (){
                                return [];
                            }); 
                        } , function (data){
                            // 当前用户的默认网址
                            var promiseCurr = D("UserWebsites").getWebsitesByUid(uid).then(function (webids){
                                var webids = getFieldFromArray(webids , "websites_id"),
                                    promiseMe = D("Websites").getWebsitesByIds(webids) ,
                                    promiseOtherGroup = D("UgroupWebsites").getOtherGroupWebsites(ugids , webids);  

                                return Promise.all([promiseMe , promiseOtherGroup]).then(function (res){
                                    var pm = res[0] ,
                                        po = res[1] ;   
                                        
                                    markEqualArray(pm , po , function (el1 , el2){
                                        return el1.id == el2.websites_id;
                                    } , function (arr , idx){
                                        arr[idx].is_protected = 2 ; //别组网址，可删，不可改
                                    });   

                                    return pm;       
                                });     
                            });  

                            //消重
                            return Promise.all([promiseGroup , promiseCurr]).then(function(res){    
                                var ret = res[0] ,
                                    retMe = res[1];

                                //合并本人、本组
                                ret.forEach(function (el , i){
                                    ret[i].is_protected = 1; //本组网址，不可删，不可改   
                                });

                                retMe = combineArray(retMe , ret , function (el1 , el2){
                                    return el1.id == el2.id;   
                                } , function (arr , idx){                                  
                                    arr[idx].is_protected = 1 ;   //本组网址，不可删，不可改 
                                });
                                
                                //插入User_websites
                                return D("UserWebsitesOrder").insert(uid , getFieldFromArray(retMe , "id")).then(function (){
                                    return retMe;
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

            data = decodeURIComponent(data);

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
                console.info(data);
                self.error(data , "操作失败" , data);  
            });          
        }  
    };
});