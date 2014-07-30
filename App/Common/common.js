//这里定义一些全局通用的函数，该文件会被自动加载
global.arrayUnique = function (arr){
    var ret = [];
    
    for(var i = 0 ; i < arr.length ; ++i){
        if (ret.indexOf(arr[i]) == -1){
            ret.push(arr[i]);
        }
    }

    return ret;        
};

global.getFieldFromArray = function(arr , field){
    var ret = [];

    arr.forEach(function (el){
        ret.push(el[field]);
    });

    return ret;
};

global.combineArray = function (arr1 , arr2 , equalFun , equalCallback){
    arr1.forEach(function (el , i){
        arr2.forEach(function (el2 , j){
            if (equalFun(el , el2)){
                arr2.splice(j , 1);

                if (equalCallback && typeof equalCallback == "function"){
                    equalCallback(arr1 , i);
                }
            }
        });                                 
    }); 

    return arr1.concat(arr2);
};

global.markEqualArray = function (arr1 , arr2 , equalFun , markFun){
    var node , decide ;

    arr1.forEach(function (el , i){
        node = arr1[i];

        decide = arr2.some(function (el2){
            return equalFun(el , el2);
        }); 

        if (decide){
            markFun(arr1 , i);
        }                                         
    });  
}