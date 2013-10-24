'use strict';

describe('AClassAbove', function() {

    var Class;

    beforeEach(function() {
        module('AClassAbove');

        inject(function(_AClassAbove_) {
            Class = _AClassAbove_;
        });

    });

    describe('subclass', function() {
        it('should create a subclass from an object', function() {
            var Klass = Class.subclass(function(){});
            expect(Klass.superclass).toBe(Class);
        });
        
        it('should inherit classMixin', function() {
            var SuperClass = Class.subclass(function(){});
            SuperClass.extend({classProperty: 'classProperty'});
            var SubClass = SuperClass.subclass(function(){});
            expect(SubClass.classProperty).toBe('classProperty');
        });
        
        it('should create a subclass from a factory function', function() {
            var Klass = Class.subclass(function(){
                this.classProp = true;
                return {
                    instanceProp: true
                };
            });
            expect(Klass.classProp).toBe(true);
            expect(Klass.prototype.instanceProp).toBe(true);
        });
    });
    
    describe('extend', function() {
        it('should add classMethods', function() {
            var Klass = Class.subclass(function(){});
            Klass.extend({classProperty: 'classProperty'});
            expect(Klass.classProperty).toBe('classProperty');
        });
        
        it('should add classMethods to a subclass', function() {
            var SuperClass = Class.subclass(function(){});
            var SubClass = SuperClass.subclass(function(){});
            SuperClass.extend({classProperty: 'classProperty'});
            expect(SubClass.classProperty).toBe('classProperty');
        });
        
        it('should not override classMethods on a subclass', function() {
            var SuperClass = Class.subclass(function(){});
            var SubClass = SuperClass.subclass(function(){});
            SuperClass.extend({classProperty: 'setOnSub'});
            SuperClass.extend({classProperty: 'setOnSuper'});
            expect(SubClass.classProperty).toBe('setOnSub');
        });
    });
    
    describe('include', function() {
        it('should add onto prototype', function() {
            var Klass = Class.subclass(function(){});
            Klass.include({a: 1});
            expect(Klass.prototype.a).toBe(1);
        });
    });

});
