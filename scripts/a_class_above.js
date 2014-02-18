angular.module('AClassAbove', [])
.provider('AClassAbove', function(){
        
        this.$get = [
            'Prototype.Class', 
            'AClassAbove.ExtendableEnumerables', 
            'AClassAbove.Convenience',
        function(Class, Extendables) {
            var plugins = Array.prototype.slice.call(arguments, 1);
            var AClassAbove = Class.create();
            
            function extend(obj) {                
                angular.forEach(obj, function(value, name){                                     
                    this.addInheritableProperties(name);  
                    this[name] = value;
                }.bind(this));
            }
            
            function addInheritableProperties() {
                var properties = Array.prototype.slice.call(arguments, 0);
                angular.forEach(properties, function(name){
                    if (this.hasOwnProperty(name)) {
                        return;
                    }
                    this._inheritableClassProperties.push(name);
                    var localName = '___'+name;   
                    
                    Object.defineProperty(this, name, {
                        get: function() {
                            if (this.hasOwnProperty(localName)) {
                                return this[localName];
                            } else if (this.superclass) {
                                return this.superclass[name];
                            }
                        },
                        set: function(val) { 
                            this[localName] = val;
                        }
                    });
                }.bind(this));   
                
                angular.forEach(this.subclasses, function(subclass){
                    subclass.addInheritableProperties(properties);
                });
            }
            
            AClassAbove._inheritableClassProperties = [];            
            AClassAbove.extend = extend;
            AClassAbove.addInheritableProperties = addInheritableProperties;
            AClassAbove.ancestors = [];
            AClassAbove.extend({
                subclass: function(options) {
                    var initFunction;
                    if (!options) options = {};
                    if (options.constructor == Function) {
                        initFunction = options;
                        options = {};
                    }
                    
                    var subclass = Class.create(this, options);
                    subclass.extend = extend;
                    subclass._inheritableClassProperties = [];
                    subclass.addInheritableProperties = addInheritableProperties;
                    subclass.addInheritableProperties.apply(subclass, this._inheritableClassProperties);
                    subclass.ancestors = this.ancestors.concat([this]);
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