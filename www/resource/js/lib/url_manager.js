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
                var url = new ue(this.handler.nameIpt.val() , this.handler.urlIpt.val()),   
                    promise = up.add(url.name , url.url);
                    
                promise.done(function (data){
                    console.info("成功");
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