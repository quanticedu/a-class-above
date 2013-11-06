angular.module('AClassAbove', [])
.provider('AClassAbove', function(){
        
        this.$get = ['Prototype.Class', 'AClassAbove.ExtendableEnumerables', function(Class, Extendables) {
            var plugins = Array.prototype.slice.call(arguments, 1);
            var AClassAbove = Class.create();
            
            function extend(obj) {
                
                // when extend is called directly on a class, the object
                // mixed in to the classMixin, which becomes an authoritative
                // record of all the class properties added at this level of the hierarchy
                angular.extend(this.classMixin, obj);
                
                // subExtend copies properties on subclasses, but does
                // not add them to the classMixin, allowing us to keep track
                // of which things have been overridden where in the hierarchy
                this.subExtend(obj);
                return this;
            }
            
            function subExtend(obj) {
                angular.extend(this, obj);
                angular.forEach(this.subclasses, function(subclass) {
                    angular.forEach(obj, function(val, key){
                        // don't override things that have been set on a subclass
                        // using extend
                        if (!subclass.classMixin.hasOwnProperty(key)) {
                            var _obj = {};
                            _obj[key] = val;
                            subclass.subExtend(_obj);
                        }
                    });
                });
            }
            
            AClassAbove.extend = extend;
            AClassAbove.subExtend = subExtend;
            AClassAbove.classMixin = {};
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
                    subclass.subExtend = AClassAbove.subExtend;
                    subclass.classMixin = {};
                    var klass = this;
                    while(klass) {
                        subclass.subExtend(klass.classMixin);
                        klass = klass.superclass;
                    }
                    subclass.subExtend(this.classMixin);
                    
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