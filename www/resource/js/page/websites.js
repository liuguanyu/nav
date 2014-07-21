(function ($){
    /* 名言、吐槽区 */
    require (["wisdom"] , function (wd){});  
})(jQuery);

(function ($){
    /* 搜索区 */
    require (["search_form"] , function (sf){
        sf.install("60px" , "200px");
    });  
})(jQuery);    

(function ($){
    /* 网址管理 */
    require (["website_entrance"] , function (ws){});  
})(jQuery);  