angular.module('AClassAbove')
.factory('AClassAbove.Convenience', [function(){
        
        return {
            
            classMixin: {
                inheritsFrom: function(klass) {
                    return this === klass || this.ancestors.indexOf(klass) > -1;
                }
            },
            
            instanceMixin: {
                isA: function(klass) {
                    return this.constructor.inheritsFrom(klass);
                }
            }
        };
        
    }]);