(function ($){
    define (["stretch_inputer"] , function (si){
        var dom = $(".search-form .ipt");

        var searchForm = {
            install : function (defaultWidth , stretchWidth){
                new si(dom , defaultWidth , stretchWidth);    
            }                         
        }

        return searchForm;
    });    
})(jQuery);    