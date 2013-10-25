'use strict';

// # Extendable Enumerables
// You can use extendable enumberables when you want to have an array or an object on a class
// that inherits all of the elements from a superclass and also
// allows the addition of new elements that will be available
// to this class and all of it's subclasses.  
//  
//
// One example use case is callbacks.  A class might have a list of 
// callbacks (i.e. beforeSave, afterInitialization, ...). Each class
// should inherit all of it's superclass's callbacks and also be
// able to add on new callbacks.

describe('AClassAbove.ExtendableEnumerables', function() {

    var AClassAbove;

    beforeEach(function() {
        module('AClassAbove');

        inject(function(_AClassAbove_) {
            AClassAbove = _AClassAbove_;
        });

    });

    describe('extendableArray', function() {
        
        // ### extendableArray
        it('should create an array that can be extended', function() {
            var Klass = AClassAbove.subclass(function(){
                // Define the extendable array with a name 'myArr'
                this.extendableArray('myArr');
            });
            var SubKlass = Klass.subclass();
            
            // Access the array with the method myArr()
            expect(Klass.myArr()).toEqual([]);
            expect(SubKlass.myArr()).toEqual([]);
            
            // Add new elements to the array with it's push() method.
            //Add an element on the superclass's array ...
            Klass.myArr().push('a');
            //... and it is accessible on the subclass;
            expect(Klass.myArr()).toEqual(['a']);
            expect(SubKlass.myArr()).toEqual(['a']);
            
            // If an element is added to the subclass, it is not
            // available in the super class
            //Add an element on the subclass's array ...
            SubKlass.myArr().push('b');
            //... and it is not available to the superclass.
            expect(Klass.myArr()).toEqual(['a']);
            expect(SubKlass.myArr()).toEqual(['a', 'b']);
        });
    });
    
    describe('extendableObject', function() {
        // ### extendableObject
        it('should create an object that can be extended', function() {
            
            var Klass = AClassAbove.subclass(function(){
                // Define the extendable object with a name 'myObj'
                this.extendableObject('myObj');
            });
            var SubKlass = Klass.subclass();
            
            // Access the object with myObj()
            expectEqualOwnProperties({}, Klass.myObj());
            expectEqualOwnProperties({}, SubKlass.myObj());
            
            // Set new properties on the object with it's set() method.
            //Set a property on the superclass's object ...
            Klass.myObj().set('a', 1);
            expectEqualOwnProperties({a: 1}, Klass.myObj());
            //... and it is accessible on the subclass;
            expectEqualOwnProperties({a: 1}, SubKlass.myObj());
            
            // If a property is set on the subclass, it is not
            // available in the super class
            //Set a property on the subclass's object ...
            SubKlass.myObj().set('b', 1);
            //... and it is not available in the superclass
            expectEqualOwnProperties({a: 1}, Klass.myObj());
            expectEqualOwnProperties({a: 1, b: 1}, SubKlass.myObj());
            
            // A subclass can override properties that have been
            // set on the superclass
            //Override a property on the subclass's object ...
            SubKlass.obj().set('a', 2);
            //... and not the superclass and subclass have different values for that property.
            expectEqualOwnProperties({a: 1}, Klass.obj());
            expectEqualOwnProperties({a: 2, b: 1}, SubKlass.obj());
        });
    });
    
    function expectEqualOwnProperties(obj1, obj2) {
        //the obj returned from extendableObject has properties on the 
        //prototype which make it different from the expected matching
        //object, but we don't care about the prototype, only the ownProperties.
        expect(obj1).toEqual(angular.extend({}, obj2));
    }

});
