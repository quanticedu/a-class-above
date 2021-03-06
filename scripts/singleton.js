'use strict';

angular.module('AClassAbove')
    .factory('Singleton', ['$injector',

        function($injector) {

            var AModuleAbove = $injector.get('AModuleAbove');

            return new AModuleAbove({

                included: function(Klass) {

                    Object.defineProperty(Klass, 'instance', {
                        get: function() {
                            this._instance = this._instance || this.createInstance();
                            return this._instance;
                        }
                    });

                },

                classMixin: {

                    // may want to override this with custom 
                    // arguments for the initialize
                    createInstance: function() {
                        return new this();
                    },

                    defineSingletonProperty: function() {
                        var args = Array.prototype.slice.call(arguments, 0);

                        args.forEach(function(meth) {
                            Object.defineProperty(this, meth, {
                                get: function() {
                                    var val = this.instance[meth];
                                    if (typeof val === 'function') {
                                        return val.bind(this.instance);
                                    } else {
                                        return val;
                                    }
                                },
                                set: function() {
                                    throw new Error(meth + ' cannot be set.  If you are trying to mock this in tests, mock it on the prototype');
                                }
                            });
                        }.bind(this));
                    }
                }
            });

        }
    ]);