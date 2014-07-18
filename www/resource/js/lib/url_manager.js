(function ($){
    define (["url_entity" , "url_ui_entity" , "url_proxy"] , function (ue , uue , up){
        /* 这块依赖太多了，有点不高兴 */ 
        var UrlManager = function (editor , siteContainer , handler){
            this.editor = editor ;
            this.siteContainer = siteContainer;
            this.handler = handler;

            this.editor.editStatus = "add";
        } ;

        UrlManager.prototype = {
            finishEdit : function (){
                if (this.editor.editStatus == "add") {
                    this.add();
                }
                else{
                    this.edit();
                }   
            },
            add : function (){
                var urlEntity = new ue(this.handler.nameIpt.val() , this.handler.urlIpt.val()),   
                    promise = up.add(urlEntity.name , urlEntity.url) ,
                    urlUiEntity = new uue(this.siteContainer),
                    self = this;
                    
                promise.done(function (data){
                    var id = data.data.id;
                    urlEntity.fillId(id);
                    urlUiEntity.add(urlEntity).always(function (){
                        self.handler.nameIpt.val("");
                        self.handler.urlIpt.val("");    
                    });
                }).fail(function (data){
                    console.info("失败");
                });        
            },
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