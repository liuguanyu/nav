(function ($){
    define(["str_util"] , function (stu){
        var tpl = '<a class="{$class}" href="{$link}" data-id="{$id}" data-sid="{$sid}"><li draggable="true"><img class="favico" src="{$favicon}"/><span>{$title}</span><i class="btn-del" title="删除"></i><i class="btn-edit" title="重命名"></i></li></a>';    
        var getAbsolute = function (dom){
            var rect = dom.getBoundingClientRect() , newRect = {};

            $.extend(newRect , rect);

            newRect.left = rect.left + (document.body.scrollLeft || document.documentElement.scrollLeft) ;
            newRect.right = rect.right + (document.body.scrollLeft || document.documentElement.scrollLeft) ;

            newRect.top = rect.top + (document.body.scrollTop || document.documentElement.scrollTop) ;
            newRect.bottom = rect.bottom + (document.body.scrollTop || document.documentElement.scrollTop) ;     

            return newRect;     
        };
        var UrlUiEntity = function (container , editor , handler){
            this.container = container;
            this.editor = editor;
            this.handler = handler;

            this.tips = $("#js-tips");
        };

        UrlUiEntity.prototype = {
            _fadeTip : (function (){
                var errorCss = "tips-error",
                    okCss = "tips-ok" ,
                    interval = 500;

                return function (node , type){
                    var rect = getAbsolute(node[0]),
                        tips = this.tips,
                        myCss = (type == "error") ? errorCss : okCss ,
                        protectedCss = (node.is_protected) ? "protected1" : "false"; 

                    tips.css({
                        left : rect.left + "px" ,
                        top  : rect.top + "px" ,
                        width : rect.width - 2 + "px" ,
                        height : rect.height - 2 + "px"     
                    })
                    .removeClass(errorCss)
                    .removeClass(okCss)
                    .addClass(myCss)
                    .html(node.html());
                    
                    return tips.fadeIn(interval).promise().then(function (){
                        return tips.fadeOut(interval).promise();
                    });
                };    
            })(),

            _buildHtml : function (ue){
                var protectedCss = (function (){
                        var protectedCssList = ["" , "protected1" , "protected2"] ,
                            pindex = ue.is_protected ? ue.is_protected  : 0;

                        return (protectedCssList[pindex] === null) ? "" : protectedCssList[pindex];
                    })(),
                    html = tpl.replace(/{\$id}/ , ue.id)
                          .replace(/{\$sid}/ , ue.sid)
                          .replace(/{\$link}/ , ue.url)
                          .replace(/{\$title}/ , ue.name)
                          .replace(/{\$favicon}/ , ue.favicon)
                          .replace(/{\$class}/ , protectedCss);

                return html;        

            },

            initUrls : function (des){
                var htmls = [] , 
                    self = this;

                des.forEach(function(de){
                    htmls.push(self._buildHtml(de));    
                }); 

                this.container.append($(htmls.join("")));  
            },

            editorValid : function (ue , dataId){
                var dtd = $.Deferred();

                if ($.trim(ue.name) == ""){
                    return dtd.reject({errno : 101 , errmsg : "网站名为空"});
                } 
  
                if ($.trim(ue.url) == ""){
                    return dtd.reject({errno : 102 , errmsg : "网址为空"});
                } 

                repeatNode = this.container.find("a[data-sid=" + ue.sid + "]"); 

                if (dataId !== undefined){
                    if (dataId == repeatNode.attr("data-id")){
                        return dtd.resolve();
                    }
                    else{
                        return dtd.reject({errno : 103 , errmsg : "重复网址"});
                    }
                }    

                if (repeatNode.length) {
                    return dtd.reject({errno : 103 , errmsg : "重复网址"});
                }

                return dtd.resolve();    
            }, 

            updateNode : function (ue , id){
                var node = this.container.find("a[data-id=" + id + "]"); 

                node.attr("data-id" , id).attr("data-sid" , ue.sid).attr("href" , ue.url);

                node.find("li span").html(ue.name);
            },

            showRepeat : function (node){
                var sid = node.sid ,
                    repeatNode =  this.container.find("a[data-sid=" + sid + "]");  

                this._fadeTip(repeatNode , "error");
            },

            add : function (ue){
                var html = this._buildHtml(ue),
                    node = $(html).css({"visbility" : "hidden"});

                this.container.append(node);
                return this._fadeTip(node , "ok");
            } ,

            fillEditByNode : function (node){
                var id = node.attr("data-id"), 
                    url = node.attr("href") , 
                    name = node.html().stripTags(),
                    handler = this.handler;  

                handler.nameIpt.val(name); 
                handler.urlIpt.val(url);
                handler.lastDataId.val(id);
            },

            remove : function (node){
                node.remove();   
            } ,

            getMyNewOrder : function (){
                var dtd = $.Deferred(),ids = [];

                this.container.find("a[data-id]").toArray().forEach(function (el){
                    ids.push($(el).attr("data-id"));
                }); 

                return dtd.resolve(ids);
            },

            edit : function (){

            } 
        };

        
        return UrlUiEntity;    
    });
})(jQuery);