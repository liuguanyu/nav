(function ($){
    define ([] , function (){
        var ManageSwitcher = function (switchDom , websitesShowerDom , managerDom){
            this.switchDom = switchDom ;
            this.websitesShowerDom = websitesShowerDom;
            this.managerDom = managerDom;

            this.status = "normal";

            this.init(); 
        }    

        ManageSwitcher.prototype = {
            init : function (){
                this._bindEvent();
            },

            openManage : function (){
                var d = $(this.switchDom);                
                d.html(d.attr("data-show-managing"));

                $(this.websitesShowerDom).addClass("managing");
                $(this.managerDom).show();
                $(this.websitesShowerDom).find("li").attr("draggable" , true);
                this.status = "managing";
            }, 

            closeManage : function (){
                var d = $(this.switchDom);                
                d.html(d.attr("data-show-normal"));

                $(this.websitesShowerDom).removeClass("managing");
                $(this.managerDom).hide();

                $(this.websitesShowerDom).find("li").attr("draggable" , false);
                this.status = "normal";                
            },

            _bindEvent : function (){
                var self = this;

                $(this.switchDom).on("click" , function (){
                    var d = $(this);

                    (self.status == "normal")
                        ? self.openManage() 
                        : self.closeManage();
                });
            }    
        };

        return ManageSwitcher;
    });    
})(jQuery);