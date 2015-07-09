(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    root.Torso = root.Torso || {};
    root.Torso.Mixins = root.Torso.Mixins || {};
    root.Torso.Mixins.collectionLoading = factory((root.jQuery || root.Zepto || root.ender || root.$));
  }
}(this, function($) {
  /**
   * Loading logic.
   *
   * @module    Torso
   * @namespace Torso.Mixins
   * @class  collectionLoadingMixin
   * @author kent.willis@vecna.com
   */
  var collectionLoadingMixin = function(base) {

    return {
      /**
       * Adds the loading mixin to the collection
       * @method constructor
       * @param args {Object} the arguments to the base constructor method
       */
      constructor: function(args) {
        base.call(this, args);
        this.loadedOnceDeferred = new $.Deferred();
        this.loadedOnce = false;
        this.loading = false;
      },

      /**
       * @method hasLoadedOnce
       * @return true if this collection has ever loaded from a fetch call
       */
      hasLoadedOnce: function() {
        return this.loadedOnce;
      },

      /**
       * @method isLoading
       * @return true if this collection is currently loading new values from the server
       */
      isLoading: function() {
        return this.loading;
      },

      /**
       * @method getLoadedOncePromise
       * @return a promise that will resolve when the collection has loaded for the first time
       */
      getLoadedOncePromise: function() {
        return this.loadedOnceDeferred.promise();
      },

      /**
       * Wraps the base fetch in a wrapper that manages loaded states
       * @method fetch
       * @param options {Object} - the object to hold the options needed by the base fetch method
       */
      fetch: function(options) {
        return this.__loadWrapper(base.prototype.fetch, options);
      },

      /**
       * Base load function that will trigger a "load-begin" and a "load-complete" as
       * the fetch happens. Use this method to wrap any method that returns a promise in loading events
       * @method __loadWrapper
       * @param fetchMethod {Function} - the method to invoke a fetch
       * @param options {Object} - the object to hold the options needed by the fetchMethod
       * @return a promise when the fetch method has completed and the events have been triggered
       */
      __loadWrapper: function(fetchMethod, options) {
        var collection = this;
        this.loading = true;
        this.trigger('load-begin');
        return $.when(fetchMethod.call(collection, options)).done(function(data, textStatus, jqXHR) {
          collection.trigger('load-complete', {success: true, data: data, textStatus: textStatus, jqXHR: jqXHR});
        }).fail(function(jqXHR, textStatus, errorThrown) {
          collection.trigger('load-complete', {success: false, jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown});
        }).always(function() {
          if (!collection.loadedOnce) {
            collection.loadedOnce = true;
            collection.loadedOnceDeferred.resolve();
          }
          collection.loading = false;
        });
      }
    };
  };

  return collectionLoadingMixin;
}));
