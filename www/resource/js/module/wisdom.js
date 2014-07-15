(function ($){
    define (["click_inputer"] , function (ci){
        var wisdom = new ci(".js-add-wisdom" , ".js-wisdom-poster" , "/api/addwisdom" , function (data){
            if (data.errno == 0){
                $(".wisdom span").html(data[0].data);
                $(".js-wisdom-poster").hide();
            }
            else{
                var txt = $(".js-wisdom-poster .ipt").val();
                if ($.trim(txt) != "")
                $(".wisdom span").html(txt);
                $(".js-wisdom-poster").hide(); 
            }
        });

        wisdom.init();
    });    
})(jQuery);    