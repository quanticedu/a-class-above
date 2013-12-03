angular.module('AClassAbove')
.factory('AModuleAbove', ['AClassAbove', function(AClassAbove){
        
    var AModuleAbove = AClassAbove.subclass(function() {
        
        return {
            
            initialize: function(options) {
                this.included = options.included || function() {};
                this.classMixin = options.classMixin || {};
                delete options.included;
                delete options.classMixin;
                this.instanceMixin = options;
            },
            
            includeIn: function(target) {
                target.include(this.instanceMixin);
                target.extend(this.classMixin);
                this.included(target);                
            }
        };
        
    });
    
    AClassAbove.extend({
        _includeWithoutAModuleAbove: AClassAbove.include
    });
    AClassAbove.include = function(moduleOrOptions) {
        if (moduleOrOptions.constructor === AModuleAbove) {
            moduleOrOptions.includeIn(this);
        } else {
            this._includeWithoutAModuleAbove(moduleOrOptions);
        }
    };
    
    return AModuleAbove;
        
}]);