(function ($){
    define (["url_entity" , "url_ui_entity" , "url_proxy"] , function (ue , uue , up){
        /* 这块依赖太多了，有点不高兴 */ 
        var UrlManager = function (editor , siteContainer , handler){
            this.editor = editor ;
            this.siteContainer = siteContainer;
            this.handler = handler;

            this.editor.editStatus = "add";

            this.init();
        } ;

        UrlManager.prototype = {
            init : function (){
                this.urlUiEntity = new uue(this.siteContainer , this.editor , this.handler);
            },    

            finishEdit : function (){
                if (this.editor.editStatus == "add") {
                    this.add();
                }
                else{
                    this.edit();
                }   
            },
            add : function (){
                var urlEntity = new ue(this.handler.nameIpt.val() , this.handler.urlIpt.val()) ,   
                    urlUiEntity = this.urlUiEntity ,
                    self = this ,
                    promise = urlUiEntity.editorValid(urlEntity)   
                    .then(function (){
                        return up.add(urlEntity.name , urlEntity.url);
                    })
                    .done(function (data){
                        urlEntity.fillId(data.data.id);
                        urlEntity.fillIsProtected(data.data.is_protected);
                        urlUiEntity.add(urlEntity);

                        self.handler.nameIpt.val("");
                        self.handler.urlIpt.val("");   
                    })
                    .fail(function (data){
                        switch(data.errno){
                            case 101:
                                self.handler.nameIpt.siblings(".error").html("请您填写网站名称");   
                                break; 
                            case 102:
                                self.handler.urlIpt.siblings(".error").html("请您填写网址");   
                                break; 
                            case 103:
                                self.handler.urlIpt.siblings(".error").html("您已经填写过这个网址"); 
                                urlUiEntity.showRepeat(urlEntity);  
                                break;
                        }
                    });        
            },

            initUrls : function (){
                var promise = up.get(),
                    self = this ;   

                promise.then(function (data){
                    var des = [];

                    data = data.data;
                    data.forEach(function (el){
                        des.push(ue.prototype.createByDataObj(el));   
                    }); 

                    self.urlUiEntity.initUrls(des);                     
                }) 
            } ,   

            remove : function(node){
                var id = node.attr("data-id"),
                    promise = up.remove(id),
                    self = this ; 

                promise.then(function (data){
                    self.urlUiEntity.remove(node);                    
                } , function (){});    

            },

            prepareEdit : function (node){
                var urlUiEntity = this.urlUiEntity;

                urlUiEntity.fillEditByNode(node); 

                this.editor.editStatus = "edit";   
            },    

            edit : function (){
                var urlUiEntity = this.urlUiEntity, 
                    urlEntity = new ue(this.handler.nameIpt.val() , this.handler.urlIpt.val()) ,
                    self = this ,
                    promise = urlUiEntity.editorValid(urlEntity , this.handler.lastDataId.val())                    

                    .then(function (){
                        return up.edit(urlEntity.name , urlEntity.url , self.handler.lastDataId.val());
                    })
                    .done(function (data){
                        urlUiEntity.updateNode(urlEntity, self.handler.lastDataId.val());

                        self.handler.nameIpt.val("");
                        self.handler.urlIpt.val("");  
                        self.editor.editStatus = "add"; 
                    })
                    .fail(function (data){
                        switch(data.errno){
                            case 101:
                                self.handler.nameIpt.siblings(".error").html("请您填写网站名称");   
                                break; 
                            case 102:
                                self.handler.urlIpt.siblings(".error").html("请您填写网址");   
                                break; 
                            case 103:
                                self.handler.urlIpt.siblings(".error").html("这个网址有重复"); 
                                urlUiEntity.showRepeat(urlEntity);  
                                break;
                        }
                    });

            },

            dealDrag : function (){
                var urlUiEntity = this.urlUiEntity;

                urlUiEntity.getMyNewOrder().then(function (data){
                    return up.drag(data);
                }).fail(function (data){

                });    
            },    

            dragger : function (selector , parentSelector , csses){
                var dragging ,
                    con = this.siteContainer,
                    self = this;

                con.delegate(selector , "dragstart" , function (e){
                    var tar = $(e.target).parent(parentSelector);

                    tar.addClass(csses.moving);  
                    dragging = tar;
                });

                con.delegate(selector , "dragover" , function (e){
                    var tar = $(e.target).parent(parentSelector) , handler;

                    e.preventDefault();

                    handler = setTimeout(function (){
                        if (tar.attr("data-id") == dragging.attr("data-id")){
                            return ;
                        }
                        clearTimeout(handler);

                        tar.siblings("."+csses.dragover).removeClass(csses.dragover);    
                        tar.addClass(csses.dragover);
                    } , 100);    
                });

                con.delegate(selector , "drop" , function (e){
                    var tar = $(e.target).parent(parentSelector);

                    var cleanUp = function (){
                        dragging.removeClass(csses.moving);
                        dragging.siblings("."+csses.dragover).removeClass(csses.dragover);
                    }

                    if (tar.attr("data-id") == dragging.attr("data-id")){
                        cleanUp();
                        return ;
                    }  

                    dragging.insertBefore(tar);

                    setTimeout (function (){
                        cleanUp();
                        self.dealDrag();  
                    } , 200);
                });
            }
        };    

        return UrlManager;    
    });
})(jQuery);