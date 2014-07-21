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
                    promise = up.add(urlEntity.name , urlEntity.url) ,
                    urlUiEntity = this.urlUiEntity ,
                    self = this;
                    
                promise.done(function (data){
                    urlEntity.fillId(data.data.id);
                    urlEntity.fillIsProtected(data.data.is_protected);
                    urlUiEntity.add(urlEntity).always(function (){
                        self.handler.nameIpt.val("");
                        self.handler.urlIpt.val("");    
                    });
                }).fail(function (data){
                    //console.info("失败");
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

            edit : function(){

            },
            remove : function (){

            },
            drag : function (){

            }
        };    

        return UrlManager;    
    });
})(jQuery);