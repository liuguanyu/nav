/**
 * controller
 * @return 
 */
module.exports = Controller("Home/BaseController" , function(){
    "use strict";
    return {
        indexAction: function(){
            this.redirect("/user/detail");
        },

        detailAction : function (){
            this.display();
        }
    };
});