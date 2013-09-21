(function($, Backbone, _) {

  /* Helpers ---------------------------------------- */

  function getTemplate(selector) {
    return $(selector)[0].content.cloneNode(true);
  }



  /* Backbone.View overrides ---------------------------------------- */

  _.extend(Backbone.View.prototype, {

    getTemplate: function() {
      return getTemplate(this.template);
    },

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

  var vent = _.extend({}, Backbone.Events);



  /* Contact model ---------------------------------------- */

  var ContactModel = Backbone.Model.extend({

    defaults: {
      firstName: "Contact",
      lastName: "Name",
      isFavorite: false
    }

  });



  /* Contacts collection ---------------------------------------- */

  var ContactsCollection = Backbone.Collection.extend({

    model: ContactModel

  });



  /* Contact view ---------------------------------------- */

  var ContactViewProxy = Backbone.RivetableProxyModel.extend({

    fullName: function() {
      var firstName = this.model.get("firstName"),
          lastName  = this.model.get("lastName")
      return [firstName, lastName].join(" ").trim();
    }

  });

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
      this.removeChildView(model);
    },

    onClickContact: function(e) {
      this.activate(e.currentTarget.dataset.modelCid);
    }

  });



  /* Contact manager view ---------------------------------------- */

  var ContactManagerView = Backbone.RivetableView.extend({

    el: "#contact-manager",

    template: "#contact-manager-template",

    rivetableModel: ContactViewProxy,

    events: {
      "click .favorite-btn": "onClickFavorite"
    },

    initialize: function() {
      this.render();
      this.listenTo(vent, "contact:selected", this.onContactSelected);
      return this;
    },

    changeModel: function(contact) {
      this.model = contact;
      this.render();
      return this;
    },

    toggleFavorite: function() {
      this.model.set("isFavorite", !this.model.get("isFavorite"));
      return this;
    },

    onContactSelected: function (contact) {
      this.changeModel(contact);
    },

    onClickFavorite: function() {
      this.toggleFavorite();
    }

  });



  /* Initialization ---------------------------------------- */

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

}(jQuery, Backbone, _));
