'use strict';

describe('AClassAbove.ExtendableEnumerables', function() {

    var Class;

    beforeEach(function() {
        module('AClassAbove');

        inject(function(_AClassAbove_) {
            Class = _AClassAbove_;
        });

    });

    describe('extendableArray', function() {
        it('should create an array that can be extended', function() {
            var Klass = Class.subclass(function(){
                this.extendableArray('arr');
            });
            var SubKlass = Klass.subclass();
            
            expect(Klass.arr()).toEqual([]);
            expect(SubKlass.arr()).toEqual([]);
            
            Klass.arr().push('a');
            expect(Klass.arr()).toEqual(['a']);
            expect(SubKlass.arr()).toEqual(['a']);
            
            SubKlass.arr().push('b');
            expect(Klass.arr()).toEqual(['a']);
            expect(SubKlass.arr()).toEqual(['a', 'b']);
        });
    });
    
    describe('extendableObject', function() {
        it('should create an object that can be extended', function() {
            var Klass = Class.subclass(function(){
                this.extendableObject('obj');
            });
            var SubKlass = Klass.subclass();
            
            expectEqualOwnProperties({}, Klass.obj());
            expectEqualOwnProperties({}, SubKlass.obj());
            
            Klass.obj().set('a', 1);
            expectEqualOwnProperties({a: 1}, Klass.obj());
            expectEqualOwnProperties({a: 1}, SubKlass.obj());
            
            SubKlass.obj().set('b', 1);
            expectEqualOwnProperties({a: 1}, Klass.obj());
            expectEqualOwnProperties({a: 1, b: 1}, SubKlass.obj());
            
            SubKlass.obj().set('a', 2);
            expectEqualOwnProperties({a: 1}, Klass.obj());
            expectEqualOwnProperties({a: 2, b: 1}, SubKlass.obj());
        });
    });
    
    function expectEqualOwnProperties(obj1, obj2) {
        // the obj returned from extendableObject has properties on the 
        // prototype which make it different from the expected matching
        // object, but we don't care about the prototype, only the ownProperties.
        expect(obj1).toEqual(angular.extend({}, obj2));
    }

});
