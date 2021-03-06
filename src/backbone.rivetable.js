(function($, Backbone, _, rivets) {

  /* Helpers ---------------------------------------- */

  var errorPfx = "Backbone.rivetable: ",

      errors = {
        noModel: "View must have `this.model` set when calling `rivetable`"
      },

      throwError = function(errorKey) {
        throw errorPfx + errors[errorKey];
      };



  /* Adapter ---------------------------------------- */

  // Lifted right from rivetsjs.com's homepage with a few minor tweaks.
  // http://rivetsjs.com/#configure

  rivets.configure({

    prefix: "rv",

    adapter: {

      subscribe: function(obj, keypath, callback) {
        obj.on("change:" + keypath, callback);
      },

      unsubscribe: function(obj, keypath, callback) {
        obj.off("change:" + keypath, callback);
      },

      read: function(obj, keypath) {
        return obj.get(keypath);
      },

      publish: function(obj, keypath, value) {
        obj.set(keypath, value);
      }

    }

  });



  /* ProxyModel ---------------------------------------- */

  var ProxyModel = Backbone.Model.extend({

    bidirectional: true,

    constructor: function(attrs, opts) {
      this.view = opts.view;
      this.model = this.view.model;
      _.bind(this.onChangeModel, this);
      this.bindEvents();
      Backbone.Model.apply(this, arguments);
      return this;
    },

    bindEvents: function() {
      this.on("destroy", this.onDestroy);
      this.listenTo(this.model, "change", _.debounce(this.onChangeModel, 10));
      this.listenTo(this, "change", _.debounce(this.onChange, 10));
      return this;
    },

    copyModelAttrs: function() {
      this.set(_.clone(this.model.attributes));
      return this;
    },

    copyAttrsToModel: function() {
      var validAttrs = this.model.keys(),
          attrs = this.pick(validAttrs);
      this.model.set(attrs);
      return this;
    },

    onDestroy: function() {
      this.view = null;
      this.stopListening(this.model);
      this.model = null;
    },

    onChangeModel: function(model, opts) {
      this.copyModelAttrs();
    },

    onChange: function() {
      if (this.bidirectional) {
        this.copyAttrsToModel();
      }
    }

  });



  /* Rivetable ---------------------------------------- */

  var rivetable = {

    defaultRivetableModel: ProxyModel,

    rivetable: function() {
      this
        .unrivetable()
        .checkForModel()
        .createProxyModel()
        .initializeRivetsView();
      return this;
    },

    checkForModel: function() {
      if (!this.model) { throwError("noModel"); }
      return this;
    },

    createProxyModel: function() {
      var proxyConsructor = this.rivetableModel || this.defaultRivetableModel;
      this.proxyModel = new proxyConsructor(null, { view: this });
      return this;
    },

    initializeRivetsView: function() {
      this.rivetsView = rivets.bind(this.el, this.proxyModel);
      this.proxyModel.copyModelAttrs();
      return this;
    },

    // Cleans up references and event handlers. Checks for existence
    // of instance variables because this method is called in `rivetable`
    // in case stuff needs to be cleaned up because the view is already
    // rivetable and just needs to be rerivetableized.
    unrivetable: function() {
      if (this.proxyModel) {
        this.proxyModel.destroy();
        this.stopListening(this.proxyModel);
        this.proxyModel = null;
      }
      if (this.rivetsView) {
        this.rivetsView.unbind();
        this.rivetsView = null;
      }
      return this;
    }

  };



  /* Exporting ---------------------------------------- */

  Backbone.rivetable = rivetable;

  Backbone.RivetableView = Backbone.View.extend({
    constructor: function() {
      Backbone.View.apply(this, arguments);
      this.rivetable();
    }
  });

  _.extend(Backbone.RivetableView.prototype, rivetable);

  Backbone.RivetableProxyModel = ProxyModel;

}(jQuery, Backbone, _, rivets));
