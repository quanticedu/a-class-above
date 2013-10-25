'use strict';

describe('AClassAbove', function() {

	var myApp, _AClassAbove;

	beforeEach(function() {
		module('AClassAbove');

		inject(function(_AClassAbove_) {
			_AClassAbove = _AClassAbove_;
		});

		// ### Adding AClassAbove to your app
		// The name of the module is 'AClassAbove'.
		// You must add it to your app as a dependency.
		myApp = angular.module('myApp', ['AClassAbove']);

	});

	describe('dependency injection', function() {
		it('should be injectable as an argument', function() {

			// ### Injecting AClassAbove into a service
			// The name of the service is also 'AClassAbove'.
			// You can inject it by including it as an argument to
			// a service in your app.
			myApp.factory(function(AClassAbove) {
				expect(AClassAbove).toBe(_AClassAbove);
			});
		});

		it('should be injectable via bracket notation', function() {

			// Or you can inject it via bracket notation,
			// which will work with minification.
			myApp.factory(['AClassAbove', function(Class) {
				expect(Class).toBe(_AClassAbove);
			}]);
		});
	});

	describe('subclass', function() {
		it('should create a subclass from an object', function() {

			myApp.factory(function(AClassAbove) {
				// Create a class by calling the 'subclass' method 
				var Klass = AClassAbove.subclass();
				expect(Klass.superclass).toBe(AClassAbove);
			});

		});

		it('should support an initialization function, and call it in the context of the new class', function() {

			myApp.factory(function(AClassAbove) {
				// If you pass a function to subclass(), then it will
				// be called in the context of your new class, allowing
				// you to add class properties and call class methods.
				var SuperClass = AClassAbove.subclass(function() {

					// _Creating a class property and a class method,
					// but not calling the method._
					this.aClassProperty = "set";
					this.aClassMethodWasCalled = false;
					this.aClassMethod = function() {
						this.aClassMethodWasCalled = true;
					};
				});

				expect(SuperClass.aClassProperty).toBe('set');
				expect(SuperClass.aClassMethodWasCalled).toBe(false);

				// _Creating a subclass, and calling the class 
				// method that was defined in the superclass._
				var SubClass = SuperClass.subclass(function() {
					this.aClassMethodWasCalled();
				});
				expect(SubClass.aClassProperty).toBe("set");
				expect(SubClass.aClassMethodWasCalled).toBe(true);
			});

		});

		it('should inherit classMixin', function() {

			myApp.factory(['AClassAbove', function(AClassAbove) {
				// Create a class by calling the 'subclass' method 
				var SuperClass = Class.subclass(function() {
					this.extend({
						classProperty: 'classProperty'
					});
				});

				var SubClass = SuperClass.subclass();
				expect(SubClass.classProperty).toBe('classProperty');
			}]);

		});

		it('should create a subclass from an initialization function', function() {
			var Klass = Class.subclass(function() {
				this.classProp = true;
				return {
					instanceProp: true
				};
			});
			expect(Klass.classProp).toBe(true);
			expect(Klass.prototype.instanceProp).toBe(true);
		});
	});
	// 
	// describe('extend', function() {
	//     it('should add classMethods', function() {
	//         var Klass = Class.subclass(function(){});
	//         Klass.extend({classProperty: 'classProperty'});
	//         expect(Klass.classProperty).toBe('classProperty');
	//     });
	//     
	//     it('should add classMethods to a subclass', function() {
	//         var SuperClass = Class.subclass(function(){});
	//         var SubClass = SuperClass.subclass(function(){});
	//         SuperClass.extend({classProperty: 'classProperty'});
	//         expect(SubClass.classProperty).toBe('classProperty');
	//     });
	//     
	//     it('should not override classMethods on a subclass', function() {
	//         var SuperClass = Class.subclass(function(){});
	//         var SubClass = SuperClass.subclass(function(){});
	//         SuperClass.extend({classProperty: 'setOnSub'});
	//         SuperClass.extend({classProperty: 'setOnSuper'});
	//         expect(SubClass.classProperty).toBe('setOnSub');
	//     });
	// });
	// 
	// describe('include', function() {
	//     it('should add onto prototype', function() {
	//         var Klass = Class.subclass(function(){});
	//         Klass.include({a: 1});
	//         expect(Klass.prototype.a).toBe(1);
	//     });
	// });
});
