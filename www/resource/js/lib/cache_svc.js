define(function(){
    var Solution = {},prefix = "ns";
    Solution.LocalStorage = {
        test: function() {
            try{return window.localStorage ? true: false;}catch(e){return false;}
        },
        methods: {
            init:function(ns){},
            set: function(ns,key,value) {
                try{localStorage.setItem(ns+key,value);}catch(e){throw e;}
            },//throw
            get: function(ns,key) {return localStorage.getItem(ns+key);},
            remove: function(ns,key) {localStorage.removeItem(ns+key);},
            clear:function(ns){
                if(!ns){
                    localStorage.clear();
                }else{
                    for(var i = 0,key;key = localStorage.key(i++);) {
                        if(key&&key.indexOf(ns)===0) {
                            localStorage.removeItem(key);
                        }
                    }
                }
            }
        }
    };
    Solution.UserData = {
        test: function() {
            try{return window.ActiveXObject&&document.documentElement.addBehavior? true: false}catch(e){return false;}
        },
        methods: {
            _owners:{},
            init:function(ns){
                if(!this._owners[ns])
                {
                    if(document.getElementById(ns))
                    {
                        this._owners[ns] = document.getElementById(ns);
                    }
                    else
                    {
                        var el = document.createElement('script'),
                        head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;
                        el.id = ns;
                        el.style.display = 'none';
                        el.addBehavior('#default#userdata');
                        head.insertBefore( el, head.firstChild );
                        this._owners[ns] = el;
                    }
                    try{this._owners[ns].load(ns);}catch(e){}
                    var _self = this;
                    window.attachEvent("onunload", function(){
                        _self._owners[ns] = null;
                    });
                }
            },
            set:function(ns,key,value){
                if(this._owners[ns]){
                    try{
                    this._owners[ns].setAttribute(key, value);
                    this._owners[ns].save(ns);
                    }catch(e){throw e;}
                }
            },
            get: function(ns,key){
                if(this._owners[ns]){
                    this._owners[ns].load(ns);
                    return this._owners[ns].getAttribute(key)||"";//避免返回null
                }
                return "";
            },
            remove: function(ns,key){
                if(this._owners[ns]){
                    this._owners[ns].removeAttribute(key);
                    this._owners[ns].save(ns);
                }
            },
            clear:function(ns){
                if(this._owners[ns]){
                    var attributes = this._owners[ns].XMLDocument.documentElement.attributes;
                    this._owners[ns].load(ns);
                    for (var i=0, attr; attr = attributes[i]; i++) {
                        this._owners[ns].removeAttribute(attr.name)
                    }
                    this._owners[ns].save(ns);
                }
            }
        }
    };
    var StoreSvc = (function(){
            if (Solution.LocalStorage.test())
            {
                return Solution.LocalStorage.methods;
            }
            if (Solution.UserData.test())
            {
                return Solution.UserData.methods;
            }
            return {
                init:function(){},
                get:function(){},
                set:function(){},
                remove:function(){},
                clear:function(){}
            };
        })(),
        _ins = {},
        CacheSvc = function(nameSpace){
            this._cache = {};
            this._ns = prefix+"_"+nameSpace+"_";
            this._inited = false;
            if(StoreSvc&&!this._inited){
                StoreSvc.init(this._ns);
            }
        };
        CacheSvc.serialize = function(value){
            return Object.stringify(value);
        };
        CacheSvc.unserialize = function(value){
           if (value == null){
               return "";
           } 
           return value.evalExp();
        };
        
    CacheSvc.prototype = {
        set:function(key,value){
            this._cache[key] = value;
            try{
                StoreSvc.set(this._ns,key,CacheSvc.serialize(value));
                return true;
            }catch(e){return false;}
        },
        get:function(key){
            if(this._cache[key]){
                return this._cache[key];
            }
            try{
                return this._cache[key] = CacheSvc.unserialize(StoreSvc.get(this._ns,key));
            }catch(e){
                return "";
            }
        },
        remove:function(key){
            try{
                StoreSvc.remove(this._ns,key);
            }catch(e){}
            this._cache[key] = null;
            delete this._cache[key];
        },
        clear:function(){
            try{
                StoreSvc.clear(this._ns);
            }catch(e){}
            this._cache = {};
        }
    };
    CacheSvc.ins = function(nameSpace){
        if(!_ins[nameSpace])
        {
            _ins[nameSpace] = new CacheSvc(nameSpace);
        }
        return _ins[nameSpace]; 
    };    

    return CacheSvc;
});