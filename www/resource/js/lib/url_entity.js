define(["md5"] , function (md5){
    var faviconUrl = 'http://cdn.website.h.qhimg.com/index.php?domain={domain}', 
        UrlEntity = function (name , url , opts){
            this.name = name;
            this.url = url;
            this.id = opts && opts.id;
            this.domain = opts && opts.domain;
            this.type = opts && opts.type;
            this.is_protected = opts && opts.is_protected;
            if(!url){
                return;
            }
            
            this.init();                  
        };

    UrlEntity.prototype = {
        createByDataObj : function (dataObj){
            var de = new UrlEntity(dataObj.title , dataObj.url , {
                id : dataObj.id , 
                is_protected : (dataObj.is_protected ? dataObj.is_protected : 0)
            });

            return de;    
        } ,    

        clearUrl : function(){ 
            var url = this.url;
            var div = document.createElement('div');
            div.innerHTML = url.replace(/<[^>]*>/gi, '');
            url = div.childNodes[0] ? div.childNodes[0].nodeValue || '' : '';

            if(!this.getUriData('protocol')){
                url = 'http://' + url;
            }
            if(!this.getUriData('path')){
                url += '/';
            }
            url = url.replace(/[\"\<\>\']/g, '');
            this.url = url;

            var name = this.name.replace(/^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g, "");
            var el = document.createElement('pre');
            var text = document.createTextNode(name);
            el.appendChild(text);
            this.name = el.innerHTML;
        },
  
        buildSid : function(){
            var url = this.url;
            try{
                url = decodeURI(url);
            }
            catch(e){}

            url = encodeURI(url);
            this.sid = md5(url);
        },

        fillId : function (id){
            this.id = id;
        },

        fillIsProtected : function (isProtected){
            this.is_protected = isProtected;
        },

        getFavicon : function(){ 
            return faviconUrl.replace('{domain}', this.domain || this.getUriData('domain'));
        },

        getUriData : function(key){
            var parser = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
                parserKeys = ["source", "protocol", "authority", "userInfo", "user", "password", "domain", "port", "relative", "path", "directory", "file", "query", "anchor"],
                m = parser.exec(this.url || ''),
                parts = {};

            for(var i = 0,l = parserKeys.length; i<l; i++){
                var k = parserKeys[i];
                parts[k] = m[i] || '';
            }

            if(key){
                return parts[key];
            }
            return parts;
        },
        init : function (){
            /*清理url数据*/
            this.clearUrl();

            /*添加其他uri属性*/
            !this.domain && (this.domain = this.getUriData('domain'));

            /*补充favicon*/
            this.favicon = this.getFavicon();

            /*生成sid*/
            this.buildSid();

            /*设置status*/        
            this.status = "";                
        }
    };
    
    return UrlEntity;    
});