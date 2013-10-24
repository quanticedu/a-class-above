angular.module('AClassAbove')
    .factory('Prototype.Array', [
        function() {

            // we don't want all of the prototype array stuff, just what class.js needs        
            return function(list) {
                return Array.prototype.slice.call(list);
            };

        }
    ]);
