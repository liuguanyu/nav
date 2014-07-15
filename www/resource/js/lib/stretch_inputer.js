(function ($){
    define ([] , function (){
        var StretchInputer = function (dom , defaultWidth , stretchWidth){
            this.dom = dom ;
            this.defaultWidth = defaultWidth;
            this.stretchWidth = stretchWidth;

            this.init(); 
        }    

        StretchInputer.prototype = {
            init : function (){
                this._bindEvent();
            },

            _bindEvent : function (){
                var self = this;

                $(this.dom).on("focus" , function (){
                    setTimeout(function (){
                        $(self.dom).select().animate({"width" : self.stretchWidth});
                    } , 100); 
                }).on("blur" , function (){
                     setTimeout(function (){
                        $(self.dom).animate({"width" : self.defaultWidth});
                    } , 100);                    
                })
            }    
        };

        return StretchInputer;
    });    
})(jQuery);