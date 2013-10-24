angular.module('AClassAbove')
.factory('AClassAbove.ExtendableEnumerables', [function(){
        
        return {
            
            classMixin: {
                extendableArray: function(name) {                    
                    var localName = "_local_"+name;
                    var obj = {};
                    obj[name] = function() {
                        if (!this.hasOwnProperty(localName)) {
                            this[localName] = [];
                        }
                        var val = [];
                        var local = this[localName];
                                             
                        if (this.superclass && this.superclass[name]) {
                            var superVal = this.superclass[name]();
                            val = val.concat(superVal);
                        }
                        
                        val = val.concat(local);
                        val.push = function() {
                            local.push.apply(local, arguments);
                        };
                        return val;
                    }
                    
                    this.extend(obj);
                },
                
                extendableObject: function(name) {                    
                    var localName = "_local_"+name;
                    var obj = {};
                    obj[name] = function() {
                        if (!this.hasOwnProperty(localName)) {
                            this[localName] = {};
                        }
                        var val = Object.create({
                            set: function(name, value) {
                                local[name] = value;
                            }
                        });
                        var local = this[localName];
                                             
                        if (this.superclass && this.superclass[name]) {
                            var superVal = this.superclass[name]();
                            angular.extend(val, superVal);
                        }
                        
                        val = angular.extend(val, local);
                        return val;
                    }
                    
                    this.extend(obj);
                },
            }
        };
        
    }]);