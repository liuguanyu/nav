(function ($){
    define([] , function (){
        var tpl = '<li class="{$class}" data-id="{$id}" data-sid="{$sid}"><a href="{$link}"><img class="favico" src="{$favicon}"/>{$title}</a><i class="btn-del" title="删除"></i><i class="btn-edit" title="重命名"></i></li>';    

        var UrlUiEntity = function (container){
            this.container = container;
            this.tips = $("#js-tips");
        };

        UrlUiEntity.prototype = {
            _fadeTip : (function (){
                var errorCss = "tips-error",
                    okCss = "tips-ok" ,
                    interval = 500;

                return function (node , type){
                    var rect = node[0].getBoundingClientRect(),
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

            add : function (ue){
                var html = this._buildHtml(ue),
                    node = $(html).css({"visbility" : "hidden"});

                this.container.append(node);
                return this._fadeTip(node , "ok");
            } ,

            remove : function (sid){

            } ,

            edit : function (){

            } ,

            drag : function (){
                
            }
        };

        
        return UrlUiEntity;    
    });
})(jQuery);