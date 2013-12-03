angular.module('AClassAbove', [])
.provider('AClassAbove', function(){
        
        this.$get = ['Prototype.Class', 'AClassAbove.ExtendableEnumerables', function(Class, Extendables) {
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
angular.module('AClassAbove')
.factory('AModuleAbove', ['AClassAbove', function(AClassAbove){
        
    var AModuleAbove = AClassAbove.subclass(function() {
        
        return {
            
            initialize: function(options) {
                this.included = options.included || function() {};
                this.classMixin = options.classMixin || {};
                delete options.included;
                delete options.classMixin;
                this.instanceMixin = options;
            },
            
            includeIn: function(target) {
                target.include(this.instanceMixin);
                target.extend(this.classMixin);
                this.included(target);                
            }
        };
        
    });
    
    AClassAbove.extend({
        _includeWithoutAModuleAbove: AClassAbove.include
    });
    AClassAbove.include = function(moduleOrOptions) {
        if (moduleOrOptions.constructor === AModuleAbove) {
            moduleOrOptions.includeIn(this);
        } else {
            this._includeWithoutAModuleAbove(moduleOrOptions);
        }
    };
    
    return AModuleAbove;
        
}]);
angular.module('AClassAbove')
.factory('AClassAbove.ExtendableEnumerables', [function(){
        
        return {
            
            classMixin: {
                /*
                does this work?
                */
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
                
                /*
                and this?
                */
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
angular.module('AClassAbove')
    .factory('Prototype.Array', [
        function() {

            // we don't want all of the prototype array stuff, just what class.js needs        
            return function(list) {
                return Array.prototype.slice.call(list);
            };

        }
    ]);

(function() {
    function update(array, args) {
        var arrayLength = array.length,
            length = args.length;
        while (length--) array[arrayLength + length] = args[length];
        return array;
    }

    /**
     *  Function#argumentNames() -> Array
     *
     *  Reads the argument names as stated in the function definition and returns
     *  the values as an array of strings (or an empty array if the function is
     *  defined without parameters).
     *
     *  ##### Examples
     *
     *      function fn(foo, bar) {
     *        return foo + bar;
     *      }
     *      fn.argumentNames();
     *      //-> ['foo', 'bar']
     *
     *      Prototype.emptyFunction.argumentNames();
     *      //-> []
     **/

    function argumentNames() {
        var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
            .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
            .replace(/\s+/g, '').split(',');
        return names.length == 1 && !names[0] ? [] : names;
    }

    /**
     *  Function#wrap(wrapper) -> Function
     *  - wrapper (Function): The function to use as a wrapper.
     *
     *  Returns a function "wrapped" around the original function.
     *
     *  [[Function#wrap]] distills the essence of aspect-oriented programming into
     *  a single method, letting you easily build on existing functions by
     *  specifying before and after behavior, transforming the return value, or
     *  even preventing the original function from being called.
     *
     *  The wraper function is called with this signature:
     *
     *      function wrapper(callOriginal[, args...])
     *
     *  ...where `callOriginal` is a function that can be used to call the
     *  original (wrapped) function (or not, as appropriate). (`callOriginal` is
     *  not a direct reference to the original function, there's a layer of
     *  indirection in-between that sets up the proper context \[`this` value\] for
     *  it.)
     *
     *  ##### Example
     *
     *      // Wrap String#capitalize so it accepts an additional argument
     *      String.prototype.capitalize = String.prototype.capitalize.wrap(
     *        function(callOriginal, eachWord) {
     *          if (eachWord && this.include(" ")) {
     *            // capitalize each word in the string
     *            return this.split(" ").invoke("capitalize").join(" ");
     *          } else {
     *            // proceed using the original function
     *            return callOriginal();
     *          }
     *        });
     *
     *      "hello world".capitalize();
     *      // -> "Hello world" (only the 'H' is capitalized)
     *      "hello world".capitalize(true);
     *      // -> "Hello World" (both 'H' and 'W' are capitalized)
     **/

    function wrap(wrapper) {
        var __method = this;
        return function() {
            var a = update([__method.bind(this)], arguments);
            return wrapper.apply(this, a);
        }
    }

    Function.prototype.wrap = wrap;
    Function.prototype.argumentNames = argumentNames;

})();

angular.module('AClassAbove')
    .factory('Prototype.Class', ['Prototype.Array', 'Prototype.Object',
        function($A, Object) {
            // a few tweaks that we need to add to get this working outside of the prototype world
            Prototype = {
                emptyFunction: function() {}
            };



            /* Based on Alex Arnell's inheritance implementation. */

            /** section: Language
             * class Class
             *
             *  Manages Prototype's class-based OOP system.
             *
             *  Refer to Prototype's web site for a [tutorial on classes and
             *  inheritance](http://prototypejs.org/learn/class-inheritance).
             **/
            var Class = (function() {

                // Some versions of JScript fail to enumerate over properties, names of which 
                // correspond to non-enumerable properties in the prototype chain
                var IS_DONTENUM_BUGGY = (function() {
                    for (var p in {
                        toString: 1
                    }) {
                        // check actual property name, so that it works with augmented Object.prototype
                        if (p === 'toString') return false;
                    }
                    return true;
                })();

                /**
                 *  Class.create([superclass][, methods...]) -> Class
                 *    - superclass (Class): The optional superclass to inherit methods from.
                 *    - methods (Object): An object whose properties will be "mixed-in" to the
                 *        new class. Any number of mixins can be added; later mixins take
                 *        precedence.
                 *
                 *  [[Class.create]] creates a class and returns a constructor function for
                 *  instances of the class. Calling the constructor function (typically as
                 *  part of a `new` statement) will invoke the class's `initialize` method.
                 *
                 *  [[Class.create]] accepts two kinds of arguments. If the first argument is
                 *  a [[Class]], it's used as the new class's superclass, and all its methods
                 *  are inherited. Otherwise, any arguments passed are treated as objects,
                 *  and their methods are copied over ("mixed in") as instance methods of the
                 *  new class. In cases of method name overlap, later arguments take
                 *  precedence over earlier arguments.
                 *
                 *  If a subclass overrides an instance method declared in a superclass, the
                 *  subclass's method can still access the original method. To do so, declare
                 *  the subclass's method as normal, but insert `$super` as the first
                 *  argument. This makes `$super` available as a method for use within the
                 *  function.
                 *
                 *  To extend a class after it has been defined, use [[Class#addMethods]].
                 *
                 *  For details, see the
                 *  [inheritance tutorial](http://prototypejs.org/learn/class-inheritance)
                 *  on the Prototype website.
                 **/

                function subclass() {};

                function create() {
                    var parent = null,
                        properties = $A(arguments);
                    if (Object.isFunction(properties[0]))
                        parent = properties.shift();

                    function klass() {
                        this.initialize.apply(this, arguments);
                    }

                    Object.extend(klass, Class.Methods);
                    klass.superclass = parent;
                    klass.subclasses = [];

                    if (parent) {
                        subclass.prototype = parent.prototype;
                        klass.prototype = new subclass;
                        parent.subclasses.push(klass);
                    }

                    for (var i = 0, length = properties.length; i < length; i++)
                        klass.addMethods(properties[i]);

                    if (!klass.prototype.initialize)
                        klass.prototype.initialize = Prototype.emptyFunction;

                    klass.prototype.constructor = klass;
                    return klass;
                }

                /**
                 *  Class#addMethods(methods) -> Class
                 *    - methods (Object): The methods to add to the class.
                 *
                 *  Adds methods to an existing class.
                 *
                 *  [[Class#addMethods]] is a method available on classes that have been
                 *  defined with [[Class.create]]. It can be used to add new instance methods
                 *  to that class, or overwrite existing methods, after the class has been
                 *  defined.
                 *
                 *  New methods propagate down the inheritance chain. If the class has
                 *  subclasses, those subclasses will receive the new methods &mdash; even in
                 *  the context of `$super` calls. The new methods also propagate to instances
                 *  of the class and of all its subclasses, even those that have already been
                 *  instantiated.
                 *
                 *  ##### Examples
                 *
                 *      var Animal = Class.create({
                 *        initialize: function(name, sound) {
                 *          this.name  = name;
                 *          this.sound = sound;
                 *        },
                 *
                 *        speak: function() {
                 *          alert(this.name + " says: " + this.sound + "!");
                 *        }
                 *      });
                 *
                 *      // subclassing Animal
                 *      var Snake = Class.create(Animal, {
                 *        initialize: function($super, name) {
                 *          $super(name, 'hissssssssss');
                 *        }
                 *      });
                 *
                 *      var ringneck = new Snake("Ringneck");
                 *      ringneck.speak();
                 *
                 *      //-> alerts "Ringneck says: hissssssss!"
                 *
                 *      // adding Snake#speak (with a supercall)
                 *      Snake.addMethods({
                 *        speak: function($super) {
                 *          $super();
                 *          alert("You should probably run. He looks really mad.");
                 *        }
                 *      });
                 *
                 *      ringneck.speak();
                 *      //-> alerts "Ringneck says: hissssssss!"
                 *      //-> alerts "You should probably run. He looks really mad."
                 *
                 *      // redefining Animal#speak
                 *      Animal.addMethods({
                 *        speak: function() {
                 *          alert(this.name + 'snarls: ' + this.sound + '!');
                 *        }
                 *      });
                 *
                 *      ringneck.speak();
                 *      //-> alerts "Ringneck snarls: hissssssss!"
                 *      //-> alerts "You should probably run. He looks really mad."
                 **/

                function addMethods(source) {
                    var ancestor = this.superclass && this.superclass.prototype,
                        properties = Object.keys(source);

                    // IE6 doesn't enumerate `toString` and `valueOf` (among other built-in `Object.prototype`) properties,
                    // Force copy if they're not Object.prototype ones.
                    // Do not copy other Object.prototype.* for performance reasons
                    if (IS_DONTENUM_BUGGY) {
                        if (source.toString != Object.prototype.toString)
                            properties.push("toString");
                        if (source.valueOf != Object.prototype.valueOf)
                            properties.push("valueOf");
                    }

                    for (var i = 0, length = properties.length; i < length; i++) {
                        var property = properties[i],
                            value = source[property];
                        if (ancestor && Object.isFunction(value) &&
                            value.argumentNames()[0] == "$super") {
                            var method = value;
                            value = (function(m) {
                                return function() {
                                    return ancestor[m].apply(this, arguments);
                                };
                            })(property).wrap(method);

                            // We used to use `bind` to ensure that `toString` and `valueOf`
                            // methods were called in the proper context, but now that we're 
                            // relying on native bind and/or an existing polyfill, we can't rely
                            // on the nuanced behavior of whatever `bind` implementation is on
                            // the page.
                            //
                            // MDC's polyfill, for instance, doesn't like binding functions that
                            // haven't got a `prototype` property defined.
                            value.valueOf = (function(method) {
                                return function() {
                                    return method.valueOf.call(method);
                                };
                            })(method);

                            value.toString = (function(method) {
                                return function() {
                                    return method.toString.call(method);
                                };
                            })(method);
                        }
                        this.prototype[property] = value;
                    }

                    return this;
                }

                return {
                    create: create,
                    Methods: {
                        addMethods: addMethods
                    }
                };
            })();

            return Class;

        }
    ]);

angular.module('AClassAbove')
    .factory('Prototype.Object', [
        function() {

            var _Object = {
                // 
                prototype: Object.prototype
            };

            /** section: Language
             * class Object
             *
             *  Extensions to the built-in [[Object]] object.
             *
             *  Because it is dangerous and invasive to augment `Object.prototype` (i.e.,
             *  add instance methods to objects), all these methods are static methods that
             *  take an [[Object]] as their first parameter.
             *
             *  [[Object]] is used by Prototype as a namespace; that is, it just keeps a few
             *  new methods together, which are intended for namespaced access (i.e. starting
             *  with "`Object.`").
             *
             *  For the regular developer (who simply uses Prototype without tweaking it), the
             *  most commonly used methods are probably [[Object.inspect]] and, to a lesser degree,
             *  [[Object.clone]].
             *
             *  Advanced users, who wish to create their own objects like Prototype does, or
             *  explore objects as if they were hashes, will turn to [[Object.extend]],
             *  [[Object.keys]], and [[Object.values]].
             **/
            (function(Object) {

                var Prototype = {
                    K: function(x) {
                        return x
                    }
                };

                var _toString = Object.prototype.toString,
                    _hasOwnProperty = Object.prototype.hasOwnProperty,
                    NULL_TYPE = 'Null',
                    UNDEFINED_TYPE = 'Undefined',
                    BOOLEAN_TYPE = 'Boolean',
                    NUMBER_TYPE = 'Number',
                    STRING_TYPE = 'String',
                    OBJECT_TYPE = 'Object',
                    FUNCTION_CLASS = '[object Function]',
                    BOOLEAN_CLASS = '[object Boolean]',
                    NUMBER_CLASS = '[object Number]',
                    STRING_CLASS = '[object String]',
                    ARRAY_CLASS = '[object Array]',
                    DATE_CLASS = '[object Date]',
                    NATIVE_JSON_STRINGIFY_SUPPORT = window.JSON &&
                        typeof JSON.stringify === 'function' &&
                        JSON.stringify(0) === '0' &&
                        typeof JSON.stringify(Prototype.K) === 'undefined';



                var DONT_ENUMS = ['toString', 'toLocaleString', 'valueOf',
                    'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'
                ];

                // Some versions of JScript fail to enumerate over properties, names of which 
                // correspond to non-enumerable properties in the prototype chain
                var IS_DONTENUM_BUGGY = (function() {
                    for (var p in {
                        toString: 1
                    }) {
                        // check actual property name, so that it works with augmented Object.prototype
                        if (p === 'toString') return false;
                    }
                    return true;
                })();

                function Type(o) {
                    switch (o) {
                        case null:
                            return NULL_TYPE;
                        case (void 0):
                            return UNDEFINED_TYPE;
                    }
                    var type = typeof o;
                    switch (type) {
                        case 'boolean':
                            return BOOLEAN_TYPE;
                        case 'number':
                            return NUMBER_TYPE;
                        case 'string':
                            return STRING_TYPE;
                    }
                    return OBJECT_TYPE;
                }

                /**
                 *  Object.extend(destination, source) -> Object
                 *  - destination (Object): The object to receive the new properties.
                 *  - source (Object): The object whose properties will be duplicated.
                 *
                 *  Copies all properties from the source to the destination object. Used by Prototype
                 *  to simulate inheritance (rather statically) by copying to prototypes.
                 *
                 *  Documentation should soon become available that describes how Prototype implements
                 *  OOP, where you will find further details on how Prototype uses [[Object.extend]] and
                 *  [[Class.create]] (something that may well change in version 2.0). It will be linked
                 *  from here.
                 *
                 *  Do not mistake this method with its quasi-namesake [[Element.extend]],
                 *  which implements Prototype's (much more complex) DOM extension mechanism.
                 **/

                function extend(destination, source) {
                    for (var property in source)
                        destination[property] = source[property];
                    return destination;
                }

                /**
                 *  Object.inspect(obj) -> String
                 *  - object (Object): The item to be inspected.
                 *
                 *  Returns the debug-oriented string representation of the object.
                 *
                 *  * `undefined` and `null` are represented as such.
                 *  * Other types are looked up for a `inspect` method: if there is one, it is used, otherwise,
                 *  it reverts to the `toString` method.
                 *
                 *  Prototype provides `inspect` methods for many types, both built-in and library-defined,
                 *  such as in [[String#inspect]], [[Array#inspect]], [[Enumerable#inspect]] and [[Hash#inspect]],
                 *  which attempt to provide most-useful string representations (from a developer's standpoint)
                 *  for their respective types.
                 *
                 *  ##### Examples
                 *
                 *      Object.inspect();
                 *      // -> 'undefined'
                 *
                 *      Object.inspect(null);
                 *      // -> 'null'
                 *
                 *      Object.inspect(false);
                 *      // -> 'false'
                 *
                 *      Object.inspect([1, 2, 3]);
                 *      // -> '[1, 2, 3]'
                 *
                 *      Object.inspect('hello');
                 *      // -> "'hello'"
                 **/

                function inspect(object) {
                    try {
                        if (isUndefined(object)) return 'undefined';
                        if (object === null) return 'null';
                        return object.inspect ? object.inspect() : String(object);
                    } catch (e) {
                        if (e instanceof RangeError) return '...';
                        throw e;
                    }
                }

                /**
                 *  Object.toJSON(object) -> String
                 *  - object (Object): The object to be serialized.
                 *
                 *  Returns a JSON string.
                 *
                 *  `undefined` and `function` types have no JSON representation. `boolean`
                 *  and `null` are coerced to strings.
                 *
                 *  For other types, [[Object.toJSON]] looks for a `toJSON` method on `object`.
                 *  If there is one, it is used; otherwise the object is treated like a
                 *  generic [[Object]].
                 *
                 *  For more information on Prototype's JSON encoder, hop to our
                 *  [tutorial](http://prototypejs.org/learn/json).
                 *
                 *  ##### Example
                 *
                 *      var data = {name: 'Violet', occupation: 'character', age: 25, pets: ['frog', 'rabbit']};
                 *      Object.toJSON(data);
                 *      //-> '{"name": "Violet", "occupation": "character", "age": 25, "pets": ["frog","rabbit"]}'
                 **/

                function toJSON(value) {
                    return Str('', {
                        '': value
                    }, []);
                }

                function Str(key, holder, stack) {
                    var value = holder[key];
                    if (Type(value) === OBJECT_TYPE && typeof value.toJSON === 'function') {
                        value = value.toJSON(key);
                    }

                    var _class = _toString.call(value);

                    switch (_class) {
                        case NUMBER_CLASS:
                        case BOOLEAN_CLASS:
                        case STRING_CLASS:
                            value = value.valueOf();
                    }

                    switch (value) {
                        case null:
                            return 'null';
                        case true:
                            return 'true';
                        case false:
                            return 'false';
                    }

                    var type = typeof value;
                    switch (type) {
                        case 'string':
                            return value.inspect(true);
                        case 'number':
                            return isFinite(value) ? String(value) : 'null';
                        case 'object':

                            for (var i = 0, length = stack.length; i < length; i++) {
                                if (stack[i] === value) {
                                    throw new TypeError("Cyclic reference to '" + value + "' in object");
                                }
                            }
                            stack.push(value);

                            var partial = [];
                            if (_class === ARRAY_CLASS) {
                                for (var i = 0, length = value.length; i < length; i++) {
                                    var str = Str(i, value, stack);
                                    partial.push(typeof str === 'undefined' ? 'null' : str);
                                }
                                partial = '[' + partial.join(',') + ']';
                            } else {
                                var keys = Object.keys(value);
                                for (var i = 0, length = keys.length; i < length; i++) {
                                    var key = keys[i],
                                        str = Str(key, value, stack);
                                    if (typeof str !== "undefined") {
                                        partial.push(key.inspect(true) + ':' + str);
                                    }
                                }
                                partial = '{' + partial.join(',') + '}';
                            }
                            stack.pop();
                            return partial;
                    }
                }

                function stringify(object) {
                    return JSON.stringify(object);
                }

                /**
                 *  Object.toQueryString(object) -> String
                 *  - object (Object): The object whose property/value pairs will be converted.
                 *
                 *  Turns an object into its URL-encoded query string representation.
                 *
                 *  This is a form of serialization, and is mostly useful to provide complex
                 *  parameter sets for stuff such as objects in the [[Ajax]] namespace (e.g.
                 *  [[Ajax.Request]]).
                 *
                 *  Undefined-value pairs will be serialized as if empty-valued. Array-valued
                 *  pairs will get serialized with one name/value pair per array element. All
                 *  values get URI-encoded using JavaScript's native `encodeURIComponent`
                 *  function.
                 *
                 *  The order of pairs in the serialized form is not guaranteed (and mostly
                 *  irrelevant anyway) &mdash; except for array-based parts, which are serialized
                 *  in array order.
                 *
                 *  ##### Examples
                 *
                 *      Object.toQueryString({ action: 'ship', order_id: 123, fees: ['f1', 'f2'], 'label': 'a demo' })
                 *      // -> 'action=ship&order_id=123&fees=f1&fees=f2&label=a+demo'
                 **/

                function toQueryString(object) {
                    return $H(object).toQueryString();
                }

                /**
                 *  Object.toHTML(object) -> String
                 *  - object (Object): The object to convert to HTML.
                 *
                 *  Converts the object to its HTML representation.
                 *
                 *  Returns the return value of `object`'s `toHTML` method if it exists; else
                 *  runs `object` through [[String.interpret]].
                 *
                 *  ##### Examples
                 *
                 *      var Bookmark = Class.create({
                 *        initialize: function(name, url) {
                 *          this.name = name;
                 *          this.url = url;
                 *        },
                 *
                 *        toHTML: function() {
                 *          return '<a href="#{url}">#{name}</a>'.interpolate(this);
                 *        }
                 *      });
                 *
                 *      var api = new Bookmark('Prototype API', 'http://prototypejs.org/api');
                 *
                 *      Object.toHTML(api);
                 *      //-> '<a href="http://prototypejs.org/api">Prototype API</a>'
                 *
                 *      Object.toHTML("Hello world!");
                 *      //-> "Hello world!"
                 *
                 *      Object.toHTML();
                 *      //-> ""
                 *
                 *      Object.toHTML(null);
                 *      //-> ""
                 *
                 *      Object.toHTML(undefined);
                 *      //-> ""
                 *
                 *      Object.toHTML(true);
                 *      //-> "true"
                 *
                 *      Object.toHTML(false);
                 *      //-> "false"
                 *
                 *      Object.toHTML(123);
                 *      //-> "123"
                 **/

                function toHTML(object) {
                    return object && object.toHTML ? object.toHTML() : String.interpret(object);
                }

                /**
                 *  Object.keys(object) -> Array
                 *  - object (Object): The object to pull keys from.
                 *
                 *  Returns an array of the object's property names.
                 *
                 *  Note that the order of the resulting array is browser-dependent &mdash; it
                 *  relies on the `for...in` loop, for which the ECMAScript spec does not
                 *  prescribe an enumeration order. Sort the resulting array if you wish to
                 *  normalize the order of the object keys.
                 *
                 *  `Object.keys` acts as an ECMAScript 5 [polyfill](http://remysharp.com/2010/10/08/what-is-a-polyfill/).
                 *  It is only defined if not already present in the user's browser, and it
                 *  is meant to behave like the native version as much as possible. Consult
                 *  the [ES5 specification](http://es5.github.com/#x15.2.3.14) for more
                 *  information.
                 *
                 *  ##### Examples
                 *
                 *      Object.keys();
                 *      // -> []
                 *
                 *      Object.keys({ name: 'Prototype', version: '1.6.1' }).sort();
                 *      // -> ['name', 'version']
                 **/

                function keys(object) {
                    if (Type(object) !== OBJECT_TYPE) {
                        throw new TypeError();
                    }
                    var results = [];
                    for (var property in object) {
                        if (_hasOwnProperty.call(object, property))
                            results.push(property);
                    }

                    // Account for the DontEnum properties in affected browsers.
                    if (IS_DONTENUM_BUGGY) {
                        for (var i = 0; property = DONT_ENUMS[i]; i++) {
                            if (_hasOwnProperty.call(object, property))
                                results.push(property);
                        }
                    }

                    return results;
                }

                /**
                 *  Object.values(object) -> Array
                 *  - object (Object): The object to pull values from.
                 *
                 *  Returns an array of the object's property values.
                 *
                 *  Note that the order of the resulting array is browser-dependent &mdash; it
                 *  relies on the `for...in` loop, for which the ECMAScript spec does not
                 *  prescribe an enumeration order.
                 *
                 *  Also, remember that while property _names_ are unique, property _values_
                 *  have no such constraint.
                 *
                 *  ##### Examples
                 *
                 *      Object.values();
                 *      // -> []
                 *
                 *      Object.values({ name: 'Prototype', version: '1.6.1' }).sort();
                 *      // -> ['1.6.1', 'Prototype']
                 **/

                function values(object) {
                    var results = [];
                    for (var property in object)
                        results.push(object[property]);
                    return results;
                }

                /**
                 *  Object.clone(object) -> Object
                 *  - object (Object): The object to clone.
                 *
                 *  Creates and returns a shallow duplicate of the passed object by copying
                 *  all of the original's key/value pairs onto an empty object.
                 *
                 *  Do note that this is a _shallow_ copy, not a _deep_ copy. Nested objects
                 *  will retain their references.
                 *
                 *  ##### Examples
                 *
                 *      var original = {name: 'primaryColors', values: ['red', 'green', 'blue']};
                 *      var copy = Object.clone(original);
                 *
                 *      original.name;
                 *      // -> "primaryColors"
                 *      original.values[0];
                 *      // -> "red"
                 *      copy.name;
                 *      // -> "primaryColors"
                 *
                 *      copy.name = "secondaryColors";
                 *      original.name;
                 *      // -> "primaryColors"
                 *      copy.name;
                 *      // -> "secondaryColors"
                 *
                 *      copy.values[0] = 'magenta';
                 *      copy.values[1] = 'cyan';
                 *      copy.values[2] = 'yellow';
                 *      original.values[0];
                 *      // -> "magenta" (it's a shallow copy, so they share the array)
                 **/

                function clone(object) {
                    return extend({}, object);
                }

                /**
                 *  Object.isElement(object) -> Boolean
                 *  - object (Object): The object to test.
                 *
                 *  Returns `true` if `object` is a DOM node of type 1; `false` otherwise.
                 *
                 *  ##### Examples
                 *
                 *      Object.isElement(new Element('div'));
                 *      //-> true
                 *
                 *      Object.isElement(document.createElement('div'));
                 *      //-> true
                 *
                 *      Object.isElement($('id_of_an_exiting_element'));
                 *      //-> true
                 *
                 *      Object.isElement(document.createTextNode('foo'));
                 *      //-> false
                 **/

                function isElement(object) {
                    return !!(object && object.nodeType == 1);
                }

                /**
                 *  Object.isArray(object) -> Boolean
                 *  - object (Object): The object to test.
                 *
                 *  Returns `true` if `object` is an [[Array]]; `false` otherwise.
                 *
                 *  ##### Examples
                 *
                 *      Object.isArray([]);
                 *      //-> true
                 *
                 *      Object.isArray($w());
                 *      //-> true
                 *
                 *      Object.isArray({ });
                 *      //-> false
                 **/

                function isArray(object) {
                    return _toString.call(object) === ARRAY_CLASS;
                }

                var hasNativeIsArray = (typeof Array.isArray == 'function') && Array.isArray([]) && !Array.isArray({});

                if (hasNativeIsArray) {
                    isArray = Array.isArray;
                }

                /**
                 *  Object.isHash(object) -> Boolean
                 *  - object (Object): The object to test.
                 *
                 *  Returns `true` if `object` is an instance of the [[Hash]] class; `false`
                 *  otherwise.
                 *
                 *  ##### Examples
                 *
                 *      Object.isHash(new Hash({ }));
                 *      //-> true
                 *
                 *      Object.isHash($H({ }));
                 *      //-> true
                 *
                 *      Object.isHash({ });
                 *      //-> false
                 **/

                function isHash(object) {
                    return object instanceof Hash;
                }

                /**
                 *  Object.isFunction(object) -> Boolean
                 *  - object (Object): The object to test.
                 *
                 *  Returns `true` if `object` is of type [[Function]]; `false` otherwise.
                 *
                 *  ##### Examples
                 *
                 *      Object.isFunction($);
                 *      //-> true
                 *
                 *      Object.isFunction(123);
                 *      //-> false
                 **/

                function isFunction(object) {
                    return _toString.call(object) === FUNCTION_CLASS;
                }

                /**
                 *  Object.isString(object) -> Boolean
                 *  - object (Object): The object to test.
                 *
                 *  Returns `true` if `object` is of type [[String]]; `false` otherwise.
                 *
                 *  ##### Examples
                 *
                 *      Object.isString("foo");
                 *      //-> true
                 *
                 *      Object.isString("");
                 *      //-> true
                 *
                 *      Object.isString(123);
                 *      //-> false
                 **/

                function isString(object) {
                    return _toString.call(object) === STRING_CLASS;
                }

                /**
                 *  Object.isNumber(object) -> Boolean
                 *  - object (Object): The object to test.
                 *
                 *  Returns `true` if `object` is of type [[Number]]; `false` otherwise.
                 *
                 *  ##### Examples
                 *
                 *      Object.isNumber(0);
                 *      //-> true
                 *
                 *      Object.isNumber(1.2);
                 *      //-> true
                 *
                 *      Object.isNumber("foo");
                 *      //-> false
                 **/

                function isNumber(object) {
                    return _toString.call(object) === NUMBER_CLASS;
                }

                /**
                 *  Object.isDate(object) -> Boolean
                 *  - object (Object): The object to test.
                 *
                 *  Returns `true` if `object` is of type [[Date]]; `false` otherwise.
                 *
                 *  ##### Examples
                 *
                 *      Object.isDate(new Date);
                 *      //-> true
                 *
                 *      Object.isDate("Dec 25, 1995");
                 *      //-> false
                 *
                 *      Object.isDate(new Date("Dec 25, 1995"));
                 *      //-> true
                 **/

                function isDate(object) {
                    return _toString.call(object) === DATE_CLASS;
                }

                /**
                 *  Object.isUndefined(object) -> Boolean
                 *  - object (Object): The object to test.
                 *
                 *  Returns `true` if `object` is of type `undefined`; `false` otherwise.
                 *
                 *  ##### Examples
                 *
                 *      Object.isUndefined();
                 *      //-> true
                 *
                 *      Object.isUndefined(undefined);
                 *      //-> true
                 *
                 *      Object.isUndefined(null);
                 *      //-> false
                 *
                 *      Object.isUndefined(0);
                 *      //-> false
                 *
                 *      Object.isUndefined("");
                 *      //-> false
                 **/

                function isUndefined(object) {
                    return typeof object === "undefined";
                }

                extend(Object, {
                    extend: extend,
                    inspect: inspect,
                    toJSON: NATIVE_JSON_STRINGIFY_SUPPORT ? stringify : toJSON,
                    toQueryString: toQueryString,
                    toHTML: toHTML,
                    keys: Object.keys || keys,
                    values: values,
                    clone: clone,
                    isElement: isElement,
                    isArray: isArray,
                    isHash: isHash,
                    isFunction: isFunction,
                    isString: isString,
                    isNumber: isNumber,
                    isDate: isDate,
                    isUndefined: isUndefined
                });
            })(_Object);

            return _Object;
        }
    ]);
