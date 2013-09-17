(function() {

  var Model = Backbone.Model.extend({}),

      ProxyModel = Backbone.RivetableProxyModel.extend({

        initialize: function() {
          this.listenTo(this.model.collection, "destroy", this.onCollectionChange);
          this.listenTo(this.model.collection, "add", this.onCollectionChange);
        },

        fullName: function() {
          return [this.get("firstName"), this.get("lastName")].join(" ");
        },

        isFirst: function() {
          return this.model.collection.first() === this.model;
        },

        isMan: function() { return this.get("firstName") === "annyong"; },

        isWoman: function() { return this.get("firstName") === "lindsay"; },

        onCollectionChange: function() {
          this.set("isFirst", this.isFirst());
          console.log( this.toJSON() );
        }

      });

      RivetableView = Backbone.RivetableView.extend({
        rivetableModel: ProxyModel
      }),

      RegularView = Backbone.View.extend({
        rivetableModel: ProxyModel,
        initialize: function() {
          this.rivetable();
        }
      });

  _.extend(RegularView.prototype, Backbone.rivetable);

  window.model = new Model({
    firstName: "Annyong",
    lastName: "Bluth",
    title: "adopted child",
    description: "saboteur"
  });

  window.collection = new Backbone.Collection([window.model, {}])

  window.view = new RivetableView({
    model: window.model,
    el: document.querySelector("#template").content.cloneNode(true)
  });

  // @TODO: This breaks bindings, unsure why
  // window.otherView = new RegularView({
  //   model: window.model,
  //   el: document.querySelector("#template").content.cloneNode(true)
  // });

  console.log( window.view );
  console.log( window.model );

  var playground = document.querySelector("#playground")
  playground.appendChild(window.view.el);
  // playground.appendChild(window.otherView.el);

}());
