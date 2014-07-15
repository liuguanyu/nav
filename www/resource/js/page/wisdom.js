(function ($){
    /* 名言、吐槽区 */
    require (["click_inputer"] , function (ci){
        var wisdom = new ci(".js-add-wisdom" , ".js-wisdom-poster" , "/api/addwisdom" , function (data){
            if (data.errno == 0){
                $(".wisdom span").html(data[0].data);
                $(".js-wisdom-poster").hide();
            }
            else{
                $(".wisdom span").html($(".js-wisdom-poster .ipt").val());
                $(".js-wisdom-poster").hide(); 
            }
        });

        wisdom.init();
    });
})(jQuery);    