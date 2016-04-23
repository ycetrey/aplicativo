angular.module('focusconcursos.services', [])
.factory('String', function(){
    return {
        reverse: function(str){
            return str.split("").reverse().join("");
        }
    }
});