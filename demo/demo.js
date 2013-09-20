(function($, Backbone, _) {

  /* Helpers ---------------------------------------- */

  function getTemplate(selector) {
    return $(selector)[0].content.cloneNode(true);
  }


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

    rivetableModel: ContactViewProxy,

    template: function() {
      return getTemplate("#contact-item");
    },

    render: function() {
      this.$el.html(this.template());
      this.rivetable();
      return this;
    },

    remove: function() {
      // @TODO: This probably makes sense to call in rivetable itself.
      this.unrivetable();
      return Backbone.RivetableView.prototype.remove.apply(this, arguments);
    }

  });



  /* Contacts manager view ---------------------------------------- */

  var ContactsManagerView = Backbone.View.extend({

    el: "#contacts-list",

    itemView: ContactView,

    boundMethods: [
      "addChildView",
      "removeChildView"
    ],

    initialize: function() {
      this.childViews = {};
      this.bindMethods();
      this.listenTo(this.collection, "add", this.onAdd);
      this.listenTo(this.collection, "remove", this.onRemove);
      this.createChildViews();
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

    onAdd: function(model) {
      this.addChildView(model);
    },

    onRemove: function(model) {
      this.removeChildView(model);
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
      contactsView = new ContactsManagerView({ collection: collection });

  window.collection = collection;
  window.contactsView = contactsView;

}(jQuery, Backbone, _));
