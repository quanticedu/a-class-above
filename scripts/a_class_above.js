angular.module('AClassAbove', [])
.provider('AClassAbove', function(){
        
        this.$get = ['Prototype.Class', 'AClassAbove.ExtendableEnumerables', function(Class, Extendables) {
            var plugins = Array.prototype.slice.call(arguments, 1);
            var AClassAbove = Class.create();
            
            function extend(obj) {
                this.classMixin = this.classMixin || {};
                angular.extend(this.classMixin, obj);
                angular.extend(this, obj);
                angular.forEach(this.subclasses, function(subclass) {
                    angular.forEach(obj, function(val, key){
                        // don't override things that have been set on a subclass
                        if (!subclass.hasOwnProperty(key)) {
                            var _obj = {};
                            _obj[key] = val;
                            subclass.extend(_obj);
                        }
                    });
                });
                return this;
            }
            
            AClassAbove.extend = extend;
            AClassAbove.extend({
                subclass: function(options) {
                    var initFunction;
                    if (!options) options = {};
                    if (options.constructor == Function) {
                        initFunction = options;
                        options = {};
                    }
                    
                    var subclass = Class.create(this, options);
                    subclass.extend = AClassAbove.extend;
                    subclass.extend(this.classMixin);
                    
                    if (initFunction) {
                        var instanceMixin = initFunction.apply(subclass) || {};
                        subclass.addMethods(instanceMixin);
                    }
                    
                    return subclass;
                },
                
                include: function(options) {
                    this.addMethods(options);
                }
            });
            
            angular.forEach(plugins, function(mixins){
                AClassAbove.extend(mixins.classMixin || {});
                AClassAbove.include(mixins.instanceMixin || {});
            }.bind(this));
            
            return angular.extend(AClassAbove, AClassAbove.classMixin);
            
        }];
        
    });