'use strict';

// # Singleton
// Singleton is a module that can be included in a class to provide 
// singleton functionality

describe('AClassAbove.Singleton', function() {

    var AClassAbove, MyClass;

    beforeEach(function() {
        module('AClassAbove');

        inject(function(_AClassAbove_, Singleton) {
            AClassAbove = _AClassAbove_;

            // Include the Singleton module to turn your class
            // into a singleton
            MyClass = AClassAbove.subclass(function() {
                this.include(Singleton);

                return {
                    myProp: 'value',

                    myMethod: function() {
                        return 'value';
                    }
                };
            });

            // Define the list of properties that exist on
            // the singleton instance that should be accessible
            // on the class
            MyClass.defineSingletonProperty('myProp');
            MyClass.defineSingletonProperty('myMethod');
        });

    });

    it('should support properties', function() {
        expect(MyClass.myProp).toBe('value');
    });

    it('should support methods', function() {
        expect(MyClass.myMethod()).toBe('value');
    });




});