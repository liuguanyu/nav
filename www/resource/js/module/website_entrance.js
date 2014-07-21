(function ($){
    define (["manage_switcher" , "website_editor"] , function (ms , we){
        var webEditor = new we(".manage-form" , ".websites"),
            mentrance = new ms(".websites-controll" , ".websites" , ".website-manage-panel");

        return mentrance;
    });    
})(jQuery);