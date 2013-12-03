'use strict';

// # AModuleAbove
// In a way similar to ruby's modules, AClassAbove modules allow you 
// to easily create a mixin with instance properties, class properties, 
// and an included method.

describe('AClassAbove.Module', function() {

    var AClassAbove, MyModule, MyClass;

    beforeEach(function() {
        module('AClassAbove');

        inject(function(_AClassAbove_, AModuleAbove) {
            AClassAbove = _AClassAbove_;
            
            // Each new module is an instance of AModuleAbove
            MyModule = new AModuleAbove({
                
                // You can define an 'included' method, which will
                // be called every time this module is included in a class
                included: function(target) {},
                
                // you can define a 'classMixin', which will be added to
                // the class using the 'extend' method
                classMixin: {
                    classProperty: 'defined'
                },
                
                // all instance properties will be added to the prototype
                // using the 'include' method
                instanceProperty: 'defined'
                
            });
            
            // Add the module to a class using the 'include' method
            MyClass = AClassAbove.subclass(function(){
                this.include(MyModule);
            });
        });

    });
    
    it('should call the included method', function() {
        spyOn(MyModule, 'included');
        MyClass = AClassAbove.subclass(function(){
            this.include(MyModule);
        });
        expect(MyModule.included).toHaveBeenCalledWith(MyClass);
    });
    
    it('should add the class mixin', function() {
       expect(MyClass.classProperty).toBe('defined');
    });
    
    it('should add the instance mixin', function() {
       expect(new MyClass().instanceProperty).toBe('defined');
    });


});
