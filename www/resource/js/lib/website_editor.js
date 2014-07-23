(function ($){
    define (["str_util" , "edit_suggest_retouch" , "url_manager"] , function (su , sug_er , um){
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

            _initUm : function (){
                this.um = new um(this.editContainer , this.websitesContainer , this);
            } ,

            _initUrls : function (){
                this.um.initUrls();
            },

            _installDrag : function (){
                this.um.dragger("li[draggable=true]" , "a[data-sid]" , {
                    moving     : "moving" ,
                    dragover   : "dragover"
                });
            },

            _bindEvent : function (){
                var self = this ;                

                this.submiter.on("click" , function (){
                    self.um.finishEdit();
                });   

                this.nameIpt.on("keypress" , function (e){
                    if (e.keyCode == 13){
                        self.um.finishEdit();
                    }    
                }); 

                this.urlIpt.on("keypress" , function (e){
                    if (e.keyCode == 13){
                        self.um.finishEdit();
                    }    
                }); 

                this.websitesContainer.delegate(".btn-del" , "click" , function (){
                    var node = $(this).parent("li").parent("a[data-sid]");

                    self.um.remove(node);
                });

                this.editContainer.find("input[type=text]").on("keypress" , function (e){
                    if (e.keyCode != 13){
                        self.editContainer.find(".error").html("");
                    }    
                });

                this.websitesContainer.delegate("a" , "click" , function (e){
                    if($(this).parent("#websites").hasClass("managing")){
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }); 


                /*
                this.websitesContainer.delegate("li[draggable=true]" , "dragstart" , function (e){
                    $(e.target).parent("a").addClass("moving");
                });  

                this.websitesContainer.delegate("li[draggable=true]" , "dragover" , function (e){
                    //$(e.target).parent("a").addClass("moving");
                    e.preventDefault();
                    console.info(e.target);
                });  
                */                            
            },

            init : function (){
                this._initUm();
                this._initUrls();
                this._installSuggest();  
                this._bindEvent(); 
                this._installDrag();
            }   
        };

        return WebsiteEditor;   
    });    
})(jQuery);