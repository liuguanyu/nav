(function ($){
    define (["str_util" , "edit_suggest_retouch"] , function (su , sug_er){
        var  WebsiteEditor  = function (editContainer , websitesContainer){
            this.editContainer = $(editContainer);
            this.websitesContainer = $(websitesContainer);

            this.nameIpt = this.editContainer.find(".sitename");
            this.urlIpt  = this.editContainer.find(".siteurl");

            this.submiter = this.editContainer.find(".btn-finish");

            this.init();
        }  

        WebsiteEditor.prototype = {
            _installSuggest : function (){
                new sug_er(this);
            },

            _bindEvent : function (){
                this.submiter.on("click" , function (){

                });    
            },

            init : function (){
                this._installSuggest();  
                this._bindEvent(); 
            }   
        };

        return WebsiteEditor;   
    });    
})(jQuery);