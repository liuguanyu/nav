(function ($){
    define ([] , function (){
        var url = "/api/url?act={act}";     

        UrlProxy =  {
            _send2Svc : function (act , data){
                var reqUrl = url.replace('{act}' , act) ; 

                return $.ajax({
                    url : reqUrl,
                    data : "data=" + JSON.stringify(data),
                    type : "POST"
                });    
            },
            add : function (name , url){      
                var act = "add" ,
                    data = {
                        name : name ,
                        url  : url 
                    };

                return this._send2Svc(act , data); 
            } ,

            get : function (){
                var act = "get" , data = {} ;

                return this._send2Svc(act , data); 
            }     
        };

        return UrlProxy;   
    });    
})(jQuery);