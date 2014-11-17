'use strict';

describe('AClassAbove', function() {

    var myApp, _AClassAbove, $injector;

    beforeEach(function() {
        module('AClassAbove');

        // ### Adding AClassAbove to your app
        // The name of the module is 'AClassAbove'.
        // You must add it to your app as a dependency.
        //Adding AClassAbove to your app
        myApp = angular.module('myApp', ['AClassAbove']);
        // ...
        module('myApp');
    });






    describe('dependency injection', function() {
        // ### Injecting AClassAbove into a service
        // The name of the service is also 'AClassAbove'.
        // You can inject it by including it as an argument to
        // a service in your app.
        it('should be injectable as an argument', function() {
            // ...
            //Injecting AClassAbove as an argument to a factory
            myApp.factory('service', function(AClassAbove) {
                expect(AClassAbove).not.toBeUndefined();

                return {
                    $get: function() {
                        return {};
                    }
                };
            });

            inject(['service',
                function() {}
            ]);

        });





        // Or you can inject it via bracket notation,
        // which will work with minification.
        it('should be injectable via bracket notation', function() {
            // ...
            //Injecting AClassAbove with bracket notation
            myApp.factory('service', ['AClassAbove',
                function(Class) {
                    expect(Class).not.toBeUndefined();

                    return {
                        $get: function() {
                            return {};
                        }
                    };
                }
            ]);

            inject(['service',
                function() {}
            ]);
        });






    });

    describe('subclass', function() {
        var AClassAbove;

        beforeEach(function() {
            inject(function(_AClassAbove_) {
                AClassAbove = _AClassAbove_;
            });
        });

        // ### Setting instance properties with an object
        // If you just want to set instance properties on your
        // new class, then you can pass an object to subclass().
        it('should create a class from an object', function() {
            // ...
            var Klass = AClassAbove.subclass({

                // 'initialize' is a special property that 
                // will be called when new instances of your
                // class are created. 
                initialize: function() {
                    this.wasInitialized = true;
                },

                instanceProperty: 'set'
            });
            expect(Klass.superclass).toBe(AClassAbove);
            expect(new Klass().wasInitialized).toBe(true);
            expect(new Klass().instanceProperty).toBe('set');

        });





        // ### The $super keyword
        // If the first argument to any instance method is '$super', then
        // that argument will refer to the superclass's method.
        it('should create a subclass and support the $super keyword', function() {
            // ...
            var SuperClass = AClassAbove.subclass({

                initialize: function() {
                    this.log = [];
                    this.log.push('SuperClass#initialize was called.');
                },

                instanceMethod: function() {
                    this.log.push('SuperClass#instanceMethod was called.');
                    return this;
                }
            });

            // SubClass1 calls $super inside of 'initialize' and
            // 'instanceMethod', so in both cases the superclass's 
            // method is called.
            var SubClass1 = SuperClass.subclass({

                initialize: function($super) {
                    //calling the superclass's initialize
                    $super();
                    this.log.push('SubClass#initialize was called');
                },

                instanceMethod: function($super) {
                    //calling the superclass's instanceMethod
                    $super();
                    this.log.push('SubClass#instanceMethod was called.');
                    return this;
                }

            });

            //verifying that the expected methods were called
            expect(new SubClass1().instanceMethod().log).toEqual([
                'SuperClass#initialize was called.',
                'SubClass#initialize was called',
                'SuperClass#instanceMethod was called.',
                'SubClass#instanceMethod was called.'
            ]);

            // SubClass2 calls $super inside of 'initialize' but not
            // 'instanceMethod', so the superclass's 'instanceMethod'
            // is never called.
            var SubClass2 = SuperClass.subclass({

                initialize: function($super) {
                    //calling the superclass's initialize
                    $super();
                    this.log.push('SubClass#initialize was called');
                },

                instanceMethod: function($super) {
                    //NOT calling the superclass's instanceMethod
                    this.log.push('SubClass#instanceMethod was called.');
                    return this;
                }

            });

            //verifying that the expected methods were called
            expect(new SubClass2().instanceMethod().log).toEqual([
                'SuperClass#initialize was called.',
                'SubClass#initialize was called',
                //SuperClass#instanceMethod was never called
                'SubClass#instanceMethod was called.'
            ]);
        });


        // ### Using an initialization function to set class properties
        // If you want to add class properties or call class methods
        // on your new class, then you can pass an initialization
        // function to subclass().  The initialization function is
        // called in the context of your new class, so use "this"
        // to access the class inside of the initialization function.
        it('should support an initialization function, and call it in the context of the new class', function() {
            // ...
            //passing an initialization function to subclass()
            var SuperClass = AClassAbove.subclass(function() {

                //Creating an inheritable class property and an inheritable
                //class method with 'extend' (see below for more on extend).
                this.extend({
                    aClassProperty: 'set',
                    aClassMethod: function() {
                        this.aClassMethodWasCalled = true;
                    }
                });

                //setting an uninheritable class property
                this.aClassMethodWasCalled = false;
            });

            //SuperClass has aClassProperty
            expect(SuperClass.aClassProperty).toBe('set');
            //we never called SuperClass.aClassMethod(), so aClassMethodWasCalled is false
            expect(SuperClass.aClassMethodWasCalled).toBe(false);

            //Creating a subclass, and calling the class 
            //method that was defined in the superclass.
            var SubClass = SuperClass.subclass(function() {
                this.aClassMethodWasCalled = false;
                this.aClassMethod();
            });

            //SubClass inherited aClassProperty
            expect(SubClass.aClassProperty).toBe("set");
            //We called SubClass.aClassMethod() in our initialization function, so aClassMethodWasCalled is true
            expect(SubClass.aClassMethodWasCalled).toBe(true);

        });





        // ### Setting class properties AND instance properties with subclass()
        // If the return value of your initialization function is
        // an object, then it will be mixed in to your class, creating
        // instance properties.
        it('should create a subclass from an initialization function', function() {
            var Klass = AClassAbove.subclass(function() {
                this.classProp = true;
                return {
                    instanceProp: true
                };
            });
            expect(Klass.classProp).toBe(true);
            expect(new Klass().instanceProp).toBe(true);
        });

        it('should work with an initialization function and $super', function() {
            var called = [];
            var SuperClass = AClassAbove.subclass(function() {
                return {
                    initialize: function() {
                        called.push('SuperClass#init');
                    },
                    meth: function() {
                        called.push('SuperClass#meth');
                    }
                }
            });

            var SubClass = SuperClass.subclass(function() {
                return {
                    initialize: function($super) {
                        $super();
                        called.push('SubClass#init');
                    },
                    meth: function($super) {
                        $super();
                        called.push('SubClass#meth');
                    }
                }
            });

            new SubClass().meth();
            expect(called).toEqual([
                'SuperClass#init',
                'SubClass#init',
                'SuperClass#meth',
                'SubClass#meth'
            ]);
        });
    });


    describe('extend', function() {
        var AClassAbove;

        beforeEach(function() {
            inject(function(_AClassAbove_) {
                AClassAbove = _AClassAbove_;
            });
        });

        // ### Creating inheritable class properties with 'extend'.
        // The 'extend' class method takes an object that will be 
        // mixed in at the class level and inherited by all subclasses.
        it('should add classMethods', function() {
            // ...
            var Klass = AClassAbove.subclass(function() {
                this.extend({
                    classProperty: 'classProperty'
                });
            });
            expect(Klass.classProperty).toBe('classProperty');
        });

        // Properties set with extend will be inherited by subclasses
        it('should allow subclasses to inherit class methods', function() {
            var SuperClass = AClassAbove.subclass();

            //If extend is called before the subclass is created, the property
            //should be inherited
            SuperClass.extend({
                classProperty: 'classProperty'
            });
            var SubClass = SuperClass.subclass();
            expect(SubClass.classProperty).toBe('classProperty');

            //If extend is called after the subclass is created, the property
            //should still be inherited            
            SuperClass.extend({
                anotherClassProperty: 'anotherClassProperty'
            });
            expect(SubClass.anotherClassProperty).toBe('anotherClassProperty');
        });

        // Properties set with extend can be overridden in subclasses
        it('should not override classMethods on a subclass', function() {
            var SuperClass = AClassAbove.subclass();
            var SubClass = SuperClass.subclass();

            SubClass.extend({
                classProperty: 'setOnSub'
            });

            //When the superclass calls extend, it should not
            //override the value that has already been set on the 
            //subclass.
            SuperClass.extend({
                classProperty: 'setOnSuper'
            });
            expect(SubClass.classProperty).toBe('setOnSub');
        });

        it('should override methods previously set with extend', function() {
            var SuperClass = AClassAbove.subclass();
            var SubClass = SuperClass.subclass();

            SuperClass.extend({
                prop: 1
            });
            SuperClass.extend({
                prop: 2
            });
            expect(SuperClass.prop).toBe(2);
            expect(SubClass.prop).toBe(2);

        });

        it('should override methods previously set with extend in a different order', function() {
            var SuperClass = AClassAbove.subclass();
            SuperClass.extend({
                prop: 1
            });
            var SubClass = SuperClass.subclass();
            SuperClass.extend({
                prop: 2
            });

            expect(SuperClass.prop).toBe(2);
            expect(SubClass.prop).toBe(2);

        });

        it('should pass class methods all the way down the hierarchy', function() {
            var SuperClass = AClassAbove.subclass();
            SuperClass.extend({
                prop: 1
            });
            var klass = SuperClass;
            for (var i = 0; i < 5; i++) {
                var subclass = klass.subclass();
                expect(subclass.prop).toBe(1);
                klass = subclass;
            }

            //if it's overridden somewhere in the hierarchy, that should be passed down from there
            klass.extend({
                prop: 2
            });
            for (var i = 0; i < 5; i++) {
                var subclass = klass.subclass();
                expect(subclass.prop).toBe(2);
                klass = subclass;
            }

            expect(SuperClass.prop).toBe(1);

        });
    });


    describe('include', function() {
        var AClassAbove;

        beforeEach(function() {
            inject(function(_AClassAbove_) {
                AClassAbove = _AClassAbove_;
            });
        });

        // # Adding instance methods with 'include'
        // If you want to add more instance properties after calling subclass(),
        // you can use include to add an instance mixin.  This is equivalent
        // to just adding the properties onto the prototype of the class.
        it('should add onto prototype', function() {
            // ...
            var Klass = AClassAbove.subclass(function() {});
            Klass.include({
                a: 1
            });
            expect(Klass.prototype.a).toBe(1);
        });
    });


    describe('isA', function() {
        var AClassAbove;

        beforeEach(function() {
            inject(function(_AClassAbove_) {
                AClassAbove = _AClassAbove_;
            });
        });

        // # isA (instance method)
        // returns true if the instance's constructor is the
        // provided class, or if any of the constructor's ancestors
        // are
        it('should indicate whether or not an object is an instance of a class', function() {
            // ...
            var Klass = AClassAbove.subclass();
            var SubKlass = Klass.subclass();
            var AnotherKlass = AClassAbove.subclass();
            expect(new SubKlass().isA(SubKlass)).toBe(true);
            expect(new SubKlass().isA(Klass)).toBe(true);
            expect(new SubKlass().isA(AnotherKlass)).toBe(false);
        });
    });

    describe('inheritsFrom', function() {
        var AClassAbove;

        beforeEach(function() {
            inject(function(_AClassAbove_) {
                AClassAbove = _AClassAbove_;
            });
        });

        // # inheritsFrom (classMethod)
        // returns true if the class is the
        // provided class, or if any of the class's ancestors
        // are
        it('should indicate whether or not a class inherits from another class', function() {
            // ...
            var Klass = AClassAbove.subclass();
            var SubKlass = Klass.subclass();
            var AnotherKlass = AClassAbove.subclass();
            expect(SubKlass.inheritsFrom(SubKlass)).toBe(true);
            expect(SubKlass.inheritsFrom(Klass)).toBe(true);
            expect(SubKlass.inheritsFrom(AnotherKlass)).toBe(false);
        });
    });
});