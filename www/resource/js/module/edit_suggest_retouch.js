(function ($){ 
    define(["suggest"] , function(sug){
        var cfg = {
            get_data_fun : "data_provider",
            pos_adjust : {"width" : -2 , "z-index" : 10},
            item_hover_style : "hover",
            item_selectors : "li",    
            data_provider : function (url , fun){
                var time = +new Date() , interval = 1.8e7 , self = this ,
                    timefun = "__timefun__" + Math.floor(time / interval); 

                if (!window[timefun]) {
                    window[timefun] = function (d){
                        fun.call(self , d);
                    }
                }  

                url = url.replace("callbackfun" , timefun);

                $.getScript(url);
            },        
            render_data_fun : function (nowWord , data){
                var suggestHtml = [] , tmpName , tmpUrl , nodeInfo ; 

                for(var i = 0 ; i < data.length ; ++i) {
                    nodeInfo = data[i].split(",");
                    tmpName = nodeInfo[0].replace(nowWord , '<em class="red">'+nowWord+'</em>'); 
                    tmpUrl = nodeInfo[1].replace(nowWord , '<em class="red">'+nowWord+'</em>'); 
                    suggestHtml.push('<li class="clearfix"><div class="sug-name">'+tmpName+'</div><div class="sug-href">&gt; '+tmpUrl+'</div></li>');
                } 

                return suggestHtml.join("");
            },
            fill_data_fun : function (item){
                var node = $(item) , 
                sname = $(node.find("div.sug-name")).html().stripTags().trim(),
                shref = $(node.find("div.sug-href")).html().stripTags().replace("&gt;" , "").trim();   
                 
                this.thisHandler.nameIpt.val(sname);
                this.thisHandler.urlIpt.val(shref);
            }                     
        };

        var cfgName = {
            data_url : "http://suggest.h.qhimg.com/index.php?biz=websitename&word=%KEYWORD%&fmt=jsonp&cnt=8&cb=%callbackfun%"   
        };  

        var cfgUrl = {
            data_url : "http://suggest.h.qhimg.com/index.php?biz=websiteurl&word=%KEYWORD%&fmt=jsonp&cb=%callbackfun%"
        };

        var EditSuggestRetouch = function (handler){
            var thisHandler = {
                this_handler : handler
            };

            this.init(thisHandler);
        };

        EditSuggestRetouch.prototype = {
            init : function (thisHandler){
                $.extend(cfgName , thisHandler);        
                $.extend(cfgName , cfg);  

                $.extend(cfgUrl , thisHandler);
                $.extend(cfgUrl , cfg);

                new sug(thisHandler.this_handler.nameIpt , cfgName);
                new sug(thisHandler.this_handler.urlIpt, cfgUrl);
            }
        };

        return EditSuggestRetouch;
    }); 
})(jQuery);       