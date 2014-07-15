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

            _bindEvent : function (){
                var self = this;

                $(this.switchDom).on("click" , function (){
                    var d = $(this);

                    if(self.status == "normal"){

                        $(self.websitesShowerDom).addClass("managing");
                        $(self.managerDom).show();

                        d.html(d.attr("data-show-managing"));

                        self.status = "managing";
                    }
                    else{
                        $(self.websitesShowerDom).removeClass("managing");
                        $(self.managerDom).hide();

                        d.html(d.attr("data-show-normal"));

                        self.status = "normal";
                    }
                });
            }    
        };

        return ManageSwitcher;
    });    
})(jQuery);