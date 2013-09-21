(function($, Backbone, _) {

  /* Backbone.View overrides ---------------------------------------- */
  // Override some Backbone methods to provide basic functionality
  // for the demo. Something like Marionette provides a lot of this
  // for you and doesn't extend the base view.

  _.extend(Backbone.View.prototype, {

    getTemplate: function() {
      return $(this.template)[0].content.cloneNode(true);
    },

    // Because of Rivets' data binding, we just get the template
    // which for this demo is an actual HTML node without any
    // sort of interpolation, add a couple of useful data attributes
    // for use later, and then call `rivetable`. We don't need to
    // call `render` again unless we do something like change the
    // view's model, which is illustrated below.
    render: function() {
      this.$el
        .html(this.getTemplate())
        .attr("data-model-cid", this.model.cid)
        .attr("data-view-cid", this.cid);
      this.rivetable();
      return this;
    },

    remove: (function() {
      var origRemove = Backbone.View.prototype.remove;
      return function() {
        // @TODO: This probably makes sense to call in rivetable itself.
        this.unrivetable();
        return origRemove.apply(this, arguments);
      };
    }())

  });



  /* App vent ---------------------------------------- */
  // Create a vent to facilitate communication across modules.

  var vent = _.extend({}, Backbone.Events);



  /* Contact model ---------------------------------------- */
  // This is the base model, intentionally dead simple because
  // the proxy model will handle a lot of the complexity.

  var ContactModel = Backbone.Model.extend({

    defaults: {
      firstName: "Contact",
      lastName: "Name",
      isFavorite: false
    }

  });



  /* Contacts collection ---------------------------------------- */
  // The collection that's used for the contacts list.

  var ContactsCollection = Backbone.Collection.extend({

    model: ContactModel

  });



  /* Contact view ---------------------------------------- */

  // An extended `RivetableProxyModel` to provide some functionality
  // that's not available on the actual model. Something like `fullName`
  // would probably make sense to actually have on the model itself,
  // but for the sake of illustrative purposes, it's defined here.
  var ContactViewProxy = Backbone.RivetableProxyModel.extend({

    fullName: function() {
      var firstName = this.model.get("firstName"),
          lastName  = this.model.get("lastName")
      return [firstName, lastName].join(" ").trim();
    }

  });

  // The view that defines list items in the contacts list. Again, pretty
  // basic Backbone stuff. Do note that the `ContactViewProxy` defined
  // above is specified as `rivetableModel` here so that our template
  // has access to the `fullName` method via `:fullName`.
  var ContactView = Backbone.RivetableView.extend({

    tagName: "li",

    className: "contact",

    template: "#contact-item-template",

    rivetableModel: ContactViewProxy,

    events: {
      "click .btn-danger": "onClickDelete"
    },

    onClickDelete: function(e) {
      e.preventDefault();
      // Avoid list view click handler
      e.stopPropagation();
      this.model.destroy();
    }

  });



  /* Contacts manager view ---------------------------------------- */
  // The view that wraps around the contacts list, mostly for the
  // purposes of the add button.

  var ContactsManagerView = Backbone.View.extend({

    el: "#contacts-manager",

    events: {
      "click .btn-success": "onClickAdd"
    },

    onClickAdd: function(e) {
      e.preventDefault();
      this.collection.add({});
    }

  });



  /* Contacts manager list view ---------------------------------------- */
  // The main view that lists all of the contacts. A lot of the functionality
  // here is pretty boilerplate and would be handled by something like
  // Marionette's CollectionView, or if not using Marionette, just some sort
  // of abstraction to add/remove child views.

  var ContactsManagerListView = Backbone.View.extend({

    el: "#contacts-list",

    itemView: ContactView,

    boundMethods: [
      "addChildView",
      "removeChildView"
    ],

    events: {
      "click .contact": "onClickContact"
    },

    initialize: function() {
      this.childViews = {};
      this.bindMethods();
      this.listenTo(this.collection, "add", this.onAdd);
      this.listenTo(this.collection, "remove", this.onRemove);
      this.createChildViews().activate(this.collection.first().cid);
      return this;
    },

    bindMethods: function() {
      var args = _.clone(this.boundMethods);
      args.unshift(this);
      _.bindAll.apply(_, args);
      return this;
    },

    createChildViews: function() {
      this.collection.each(this.addChildView);
      return this;
    },

    addChildView: function(model) {
      var childView = new this.itemView({ model: model });
      this.childViews[model.cid] = childView;
      this.$el.append(childView.render().el);
      return this;
    },

    removeChildView: function(model) {
      var childView = this.childViews[model.cid];
      this.childViews[model.cid] = null;
      childView.remove();
      return this;
    },

    activate: function(modelCid) {
      var model = this.collection.get(modelCid);
      this.$(".contact").removeClass("active")
        .filter("[data-model-cid='" + modelCid + "']")
        .addClass("active");
      vent.trigger("contact:selected", model);
      return this;
    },

    onAdd: function(model) {
      this.addChildView(model).activate(model.cid);
    },

    onRemove: function(model) {
      this.removeChildView(model).activate(this.collection.first().cid);
    },

    onClickContact: function(e) {
      this.activate(e.currentTarget.dataset.modelCid);
    }

  });



  /* Contact manager view ---------------------------------------- */
  // The view that allows a contact to be edited. Because `RivetableProxyModel`
  // is `bidirectional` by default, any changes to the proxy model via
  // the form elements will result in changing the underlying, real model,
  // thereby updating the corresponding list item since they share the
  // same model (but have different proxy models).

  var ContactManagerView = Backbone.RivetableView.extend({

    el: "#contact-manager",

    template: "#contact-manager-template",

    rivetableModel: ContactViewProxy,

    events: {
      "click .favorite-btn": "onClickFavorite",
      "click .btn-danger": "onClickDelete"
    },

    initialize: function() {
      this.render();
      this.listenTo(vent, "contact:selected", this.onContactSelected);
      return this;
    },

    focusFirstField: function(select) {
      var method = select ? "select" : "focus";
      this.$("input:first")[method]();
      return this;
    },

    // Normally we'd probably throw the view away and create a new one,
    // but for illustration purposes we can also change the model. Because
    // the `render` method calls `rivetable`, a new proxy model will be
    // created and everything should be hooked up correctly.
    changeModel: function(contact) {
      this.model = contact;
      this.render();
      return this;
    },

    render: function() {
      Backbone.RivetableView.prototype.render.apply(this, arguments);
      var isDefaultName = this.model.get("firstName") === this.model.defaults.firstName;
      this.focusFirstField(isDefaultName);
      return this;
    },

    // We could use a checkbox and another rivets binding in the template
    // to negate the need for this function and the handler that calls it,
    // but this just demonstrates that everything still works as expected.
    toggleFavorite: function() {
      this.model.set("isFavorite", !this.model.get("isFavorite"));
      return this;
    },

    onContactSelected: function (contact) {
      this.changeModel(contact);
    },

    onClickFavorite: function() {
      this.toggleFavorite();
    },

    onClickDelete: function() {
      this.model.destroy();
    }

  });



  /* Initialization ---------------------------------------- */
  // Some simple initialization to create the views and kick off the app.

  var sampleData = [
        { firstName: "Homer",  lastName: "Simpson", isFavorite: true },
        { firstName: "Marge",  lastName: "Simpson", isFavorite: false },
        { firstName: "Bart",   lastName: "Simpson", isFavorite: false },
        { firstName: "Lisa",   lastName: "Simpson", isFavorite: false },
        { firstName: "Maggie", lastName: "Simpson", isFavorite: false }
      ],
      collection = new ContactsCollection(sampleData),
      contactsView = new ContactsManagerView({ collection: collection }),
      contactsListView = new ContactsManagerListView({ collection: collection }),
      contactManagerView = new ContactManagerView({ model: collection.first() });

  window.collection = collection;
  window.contactsListView = contactsListView;
  window.contactManagerView = contactManagerView;

}(jQuery, Backbone, _));
