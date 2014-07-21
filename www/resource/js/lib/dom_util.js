define(function (){
    var Browser = (function() {
        var na = window.navigator,
            ua = na.userAgent.toLowerCase(),
            browserTester = /(msie|webkit|gecko|presto|opera|safari|firefox|chrome|maxthon|android|ipad|iphone|webos|hpwos|trident)[ \/os]*([\d_.]+)/ig,
            Browser = {
                platform: na.platform
            };

        ua.replace(browserTester, function(a, b, c) {
            if (!Browser[b]) {
                Browser[b] = c;
            }
        });

        if (Browser.opera) { //Opera9.8后版本号位置变化
            ua.replace(/opera.*version\/([\d.]+)/, function(a, b) {
                Browser.opera = b;
            });
        }

        //IE 11 的 UserAgent：Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv 11.0) like Gecko
        if (!Browser.msie && Browser.trident) {
            ua.replace(/trident\/[0-9].*rv[ :]([0-9.]+)/ig, function(a, c) {
                    Browser.msie = c;
                });
        }

        if (Browser.msie) {
            Browser.ie = Browser.msie;
            var v = parseInt(Browser.msie, 10);
            Browser['ie' + v] = true;
        }

        return Browser;
    }());

    var DomU = {
        getDocRect: function(doc) {
            doc = doc || document;

            var win = doc.defaultView || doc.parentWindow,
                mode = doc.compatMode,
                root = doc.documentElement,
                h = win.innerHeight || 0,
                w = win.innerWidth || 0,
                scrollX = win.pageXOffset || 0,
                scrollY = win.pageYOffset || 0,
                scrollW = root.scrollWidth,
                scrollH = root.scrollHeight;

            if (mode != 'CSS1Compat') { // Quirks
                root = doc.body;
                scrollW = root.scrollWidth;
                scrollH = root.scrollHeight;
            }

            if (mode && !Browser.opera) { // IE, Gecko
                w = root.clientWidth;
                h = root.clientHeight;
            }

            scrollW = Math.max(scrollW, w);
            scrollH = Math.max(scrollH, h);

            scrollX = Math.max(scrollX, doc.documentElement.scrollLeft, doc.body.scrollLeft);
            scrollY = Math.max(scrollY, doc.documentElement.scrollTop, doc.body.scrollTop);

            return {
                width: w,
                height: h,
                scrollWidth: scrollW,
                scrollHeight: scrollH,
                scrollX: scrollX,
                scrollY: scrollY
            };
        },

        create: (function() {
            var temp = document.createElement('div'),
                wrap = {
                    option: [1, '<select multiple="multiple">', '</select>'],
                    optgroup: [1, '<select multiple="multiple">', '</select>'],
                    legend: [1, '<fieldset>', '</fieldset>'],
                    thead: [1, '<table>', '</table>'],
                    tbody: [1, '<table>', '</table>'],
                    tfoot : [1, '<table>', '</table>'],
                    tr: [2, '<table><tbody>', '</tbody></table>'],
                    td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
                    th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
                    col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
                    _default: [0, '', '']
                },
                tagName = /<(\w+)/i;
            return function(html, rfrag, doc) {
                var dtemp = (doc && doc.createElement('div')) || temp,
                    root = dtemp,
                    tag = (tagName.exec(html) || ['', ''])[1],
                    wr = wrap[tag] || wrap._default,
                    dep = wr[0];
                dtemp.innerHTML = wr[1] + html + wr[2];
                while (dep--) {
                    dtemp = dtemp.firstChild;
                }
                var el = dtemp.firstChild;
                if (!el || !rfrag) {
                    while (root.firstChild) {
                        root.removeChild(root.firstChild);
                    }
                    //root.innerHTML = '';
                    return el;
                } else {
                    doc = doc || document;
                    var frag = doc.createDocumentFragment();
                    while (el = dtemp.firstChild) {
                        frag.appendChild(el);
                    }
                    return frag;
                }
            };
        }()),        
    };    

    var ObjectH = {
        isWrap: function(obj, coreName) {
            return !!(obj && obj[coreName || 'core']);
        }
    };

    var NodeH = {
        /** 
         * 获取element对象距离doc的xy坐标
         * 参考YUI3.1.1
         * @refer  https://github.com/yui/yui3/blob/master/build/dom/dom.js
         * @method  getXY
         * @param   {element|string|wrap}   el      id,Element实例或wrap
         * @return  {array}                 x, y
         */
        getSize: function(el) {
            el = g(el);
            return {
                width: el.offsetWidth,
                height: el.offsetHeight
            };
        },
        cssHooks: (function() {
            var hooks = {
                'float': {
                    get: function(el, current, pseudo) {
                        if (current) {
                            var style = el.ownerDocument.defaultView.getComputedStyle(el, pseudo || null);
                                return style ? style.getPropertyValue('float') : null;
                        } else {
                            return el.style.cssFloat;
                        }
                    },
                    set: function(el, value) {
                        el.style.cssFloat = value;
                    },
                    remove : function (el) {
                        el.style.removeProperty('float');
                    }
                },
                'width' : {
                    get: function(el, current, pseudo) {
                        if (!current) {
                            return el.style.width;
                        }
                        var result = getCommonCurrentStyle(el, 'width', pseudo);
                        if (result && (/^\d*(px)*$/).test(result)) {
                                return result;
                        }
                        return NodeH.getSize(el)['width'] + 'px';
                    }
                },
                'height' : {
                    get: function(el, current, pseudo) {
                        if (!current) {
                            return el.style.height;
                        }
                        var result = getCommonCurrentStyle(el, 'height', pseudo);
                        if (result && (/^\d*(px)*$/).test(result)) {
                                return result;
                        }
                        return NodeH.getSize(el)['height'] + 'px';
                    }
                }
            };


            if (Browser.ie) {
                hooks['float'] = {
                    get: function(el, current) {
                        return el[current ? 'currentStyle' : 'style'].styleFloat;
                    },
                    set: function(el, value) {
                        el.style.styleFloat = value;
                    },
                    remove : function (el) {
                        el.style.removeAttribute('styleFloat');
                    }
                };

                //对于IE9+，支持了标准的opacity，如果还走这个分支会有问题.（by Jerry Qu, code from JQuery.）
                var div = document.createElement('div'), link;
                div.innerHTML = "<a href='#' style='opacity:.55;'>a</a>";
                link = div.getElementsByTagName('a')[0];

                if(link && ! /^0.55$/.test( link.style.opacity )) {
                    var ralpha = /alpha\([^)]*\)/i,
                        ropacity = /opacity=([^)]*)/;

                    hooks.opacity = {
                        get: function(el, current) {
                            return ropacity.test( (current && el.currentStyle ? el.currentStyle.filter : el.style.filter) || "" ) ?
                                ( parseFloat( RegExp.$1 ) / 100 ) + "" :
                                current ? "1" : "";
                        },

                        set: function(el, value) {
                            var style = el.style,
                                currentStyle = el.currentStyle;

                            // IE has trouble with opacity if it does not have layout
                            // Force it by setting the zoom level
                            style.zoom = 1;

                            var opacity = "alpha(opacity=" + value * 100 + ")",
                                filter = currentStyle && currentStyle.filter || style.filter || "";

                            style.filter = ralpha.test( filter ) ?
                                filter.replace( ralpha, opacity ) :
                                filter + " " + opacity;
                        },

                        remove : function (el) {
                            var style = el.style,
                                currentStyle = el.currentStyle,
                                filter = currentStyle && currentStyle.filter || style.filter || "";

                            if(ralpha.test( filter )) {
                                style.filter = filter.replace(ralpha, '');
                            }

                            style.removeAttribute('opacity');
                        }
                    };
                }
            }
            return hooks;
        }()),

        getXY: (function() {
            var calcBorders = function(node, xy) {
                var t = parseInt(NodeH.getCurrentStyle(node, 'borderTopWidth'), 10) || 0,
                    l = parseInt(NodeH.getCurrentStyle(node, 'borderLeftWidth'), 10) || 0;

                if (Browser.gecko) {
                    if (/^t(?:able|d|h)$/i.test(node.tagName)) {
                        t = l = 0;
                    }
                }
                xy[0] += l;
                xy[1] += t;
                return xy;
            };
            // the trick: body's offsetWidth was in CSS pixels, while
            // getBoundingClientRect() was in system pixels in IE7.
            // Thanks to http://help.dottoro.com/ljgshbne.php
            return (!Browser.ie6 && !Browser.ie7 && document.documentElement.getBoundingClientRect) ?
                function(node) {
                    var doc = node.ownerDocument,
                        docRect = DomU.getDocRect(doc),
                        scrollLeft = docRect.scrollX,
                        scrollTop = docRect.scrollY,
                        box = node.getBoundingClientRect(),
                        xy = [box.left, box.top],
                        mode,
                        off1,
                        off2;
                    if (Browser.ie) {
                        off1 = doc.documentElement.clientLeft;
                        off2 = doc.documentElement.clientTop;
                        mode = doc.compatMode;

                        if (mode == 'BackCompat') {
                            off1 = doc.body.clientLeft;
                            off2 = doc.body.clientTop;
                        }

                        xy[0] -= off1;
                        xy[1] -= off2;

                    }

                    if (scrollTop || scrollLeft) {
                        xy[0] += scrollLeft;
                        xy[1] += scrollTop;
                    }

                    return xy;

                } : function(node) {
                    var xy = [node.offsetLeft, node.offsetTop],
                        parentNode = node,
                        doc = node.ownerDocument,
                        docRect = DomU.getDocRect(doc),
                        bCheck = !!(Browser.gecko || parseFloat(Browser.webkit) > 519),
                        scrollTop = 0,
                        scrollLeft = 0;

                    while ((parentNode = parentNode.offsetParent)) {
                        xy[0] += parentNode.offsetLeft;
                        xy[1] += parentNode.offsetTop;
                        if (bCheck) {
                            xy = calcBorders(parentNode, xy);
                        }
                    }

                    if (NodeH.getCurrentStyle(node, 'position') != 'fixed') {
                        parentNode = node;

                        while (parentNode = parentNode.parentNode) {
                            scrollTop = parentNode.scrollTop;
                            scrollLeft = parentNode.scrollLeft;

                            if (Browser.gecko && (NodeH.getCurrentStyle(parentNode, 'overflow') !== 'visible')) {
                                xy = calcBorders(parentNode, xy);
                            }

                            if (scrollTop || scrollLeft) {
                                xy[0] -= scrollLeft;
                                xy[1] -= scrollTop;
                            }
                        }

                    }

                    xy[0] += docRect.scrollX;
                    xy[1] += docRect.scrollY;

                    return xy;
                };

        }()),  
        
        getCurrentStyle: function(el, attribute, pseudo) {
            el = g(el);

            var displayAttribute = StringH.camelize(attribute),
                hook = NodeH.cssHooks[displayAttribute];

            if (hook && hook.get) {
                return hook.get(el, true, pseudo);
            } else {
                return getCommonCurrentStyle(el, attribute, pseudo);
            } 
        },              
    };

    var g = function(el, doc) {
        if ('string' == typeof el) {
            el = el.replace(/^\s+/,'');
            if (el.indexOf('<') == 0) {return DomU.create(el, false, doc); }
            var retEl = (doc || document).getElementById(el),els;
            if (retEl && retEl.id != el) {
                els = (doc || document).getElementsByName(el);
                for(var i = 0; i < els.length; i++){
                    if (els[i].id == el) {
                        return els[i];
                    }
                }
                return null;
            }
            return retEl;
        } else {
            return (ObjectH.isWrap(el)) ? arguments.callee(el[0]) : el; //如果NodeW是数组的话，返回第一个元素(modified by akira)
        }
    };

    var StringH = {
        /** 
         * 驼峰化字符串。将“ab-cd”转化为“abCd”
         * @method camelize
         * @static
         * @param {String} s 字符串
         * @return {String}  返回转化后的字符串
         */
        camelize: function(s) {
            return s.replace(/\-(\w)/ig, function(a, b) {
                return b.toUpperCase();
            });
        },

        /** 
         * 反驼峰化字符串。将“abCd”转化为“ab-cd”。
         * @method decamelize
         * @static
         * @param {String} s 字符串
         * @return {String} 返回转化后的字符串
         */
        decamelize: function(s) {
            return s.replace(/[A-Z]/g, function(a) {
                return "-" + a.toLowerCase();
            });
        }        
    };

    var getCommonCurrentStyle = function (el, attribute, pseudo) {
        var displayAttribute = StringH.camelize(attribute);
        if (Browser.ie) {
            return el.currentStyle[displayAttribute];
        } else {
            var style = el.ownerDocument.defaultView.getComputedStyle(el, pseudo || null);
            return style ? style.getPropertyValue(StringH.decamelize(attribute)) : null;
        }
    }

    var Dom = {
        getRect : function(el) {
            el = g(el);
            var p = NodeH.getXY(el);
            var x = p[0];
            var y = p[1];
            var w = el.offsetWidth;
            var h = el.offsetHeight;
            return {
                'width': w,
                'height': h,
                'left': x,
                'top': y,
                'bottom': y + h,
                'right': x + w
            };
        }, 
    }; 

    return { 
        Dom : Dom ,
        DomU : DomU
    };      
});