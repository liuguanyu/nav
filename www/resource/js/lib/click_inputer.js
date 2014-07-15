(function ($){
    define ([] , function (){
        var defSucc = function (data){
            this.iptDom.hide();    
        };

        var defFail = function (data){
            this.iptDom.hide();             
        };

        var clickInputer = function (triggerDom , iptDom  , reqUrl  , succ , fail){
            var self = this;

            this.triggerDom = $(triggerDom);
            this.iptDom = $(iptDom);

            this.reqUrl = reqUrl;

            this.succ = succ ? function (){
                succ.call(self , arguments)
            } : function (){
                defSucc.call(self , arguments);
            };    

            this.fail = fail ? function (){
                fail.call(self , arguments)
            } : function (){
                defFail.call(self , arguments);
            }; 
        } ;

        clickInputer.prototype = {
            _submitInputContent : function (){
                var self = this , 
                    reqUrl = self.reqUrl,
                    ipt = this.iptDom.find(".js-ipt"),
                    iptName = ipt.attr("name"),
                    iptValue = $.trim(ipt.val()),
                    data = {} ;

                data[iptName] = iptValue;

                $.ajax({
                    url: reqUrl ,
                    type: "POST",
                    data: data ,
                    timeout: 3000,
                    success: function (data) {      
                        self.succ.call(self , data);
                    } , 
                    fail : function (data){
                        self.fail.call(self , data);
                    }
                }); 
            } , 

            _bindEvent  : function (){
                var self = this;

                this.triggerDom.on("click" , function (e){
                    var tar = e.target;

                    self.iptDom.show();

                    if (tar.tagName == "A"){
                        e.preventDefault();
                    }

                    self.iptDom.find(".js-ipt").focus();
                });

                this.iptDom.find(".js-btn").on("click" , function (){
                    self._submitInputContent()
                });

                this.iptDom.find(".js-ipt").on("keypress" , function (e){                    
                    if (e.keyCode == 13){
                        self._submitInputContent();
                    }    
                });   

                this.iptDom.find(".js-close").on("click" , function (e){
                    var tar = e.target;

                    self.iptDom.hide();

                    if (tar.tagName == "A"){
                        e.preventDefault();
                    }                    
                });
            },        

            init : function (){
                this._bindEvent();
            }
        };

        return clickInputer;
    });    
})(jQuery);