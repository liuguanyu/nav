(function ($){
    define ([] , function (){
        /* 这块依赖太多了，有点不高兴 */ 
        var UrlManager = function (editor , siteContainer , handler){
            this.editor = editor ;
            this.siteContainer = siteContainer;
            this.handler = handler;
        } ;

        UrlManager.prototype = {
            add : function (){
                var siteUrl = this.handler.urlIpt.val(),
                    siteName = this.handler.nameIpt.val();

                       
            }
        };    

        return UrlManager;    
    });
})(jQuery);