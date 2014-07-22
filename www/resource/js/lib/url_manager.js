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
                this.urlUiEntity = new uue(this.siteContainer);
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
                    promise = urlUiEntity.canAdd(urlEntity)   
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
            edit : function (){

            },
            dragStart : function (evt , obj){
                this.urlUiEntity.dragStart(evt , obj); 
            }
        };    

        return UrlManager;    
    });
})(jQuery);