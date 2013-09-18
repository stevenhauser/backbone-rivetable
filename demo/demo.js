(function() {

  var Model = Backbone.Model.extend({}),

      ProxyModel = Backbone.RivetableProxyModel.extend({

        initialize: function() {
          this.listenTo(this.model.collection, "remove", this.onCollectionChange);
          this.listenTo(this.model.collection, "add", this.onCollectionChange);
          this.updatePosition().updateClasses();
        },

        updatePosition: function() {
          this.set("isFirst", this.isFirst());
          return this;
        },

        updateClasses: function() {
          var classes = "red green blue".split(" "),
              self = this;
          this.set("class", classes[_.random(0, classes.length - 1)]);
          setTimeout(function() {
            self.updateClasses();
          }, _.random(750, 3000));
        },

        isFirst: function() {
          return this.model.collection.first() === this.model;
        },

        fullName: function() {
          return [this.get("firstName"), this.get("lastName")].join(" ");
        },

        onCollectionChange: function() {
          this.updatePosition();
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

  window.otherView = new RegularView({
    model: window.model,
    el: document.querySelector("#template").content.cloneNode(true)
  });

  console.log( window.view );
  console.log( window.model );

  var playground = document.querySelector("#playground")
  playground.appendChild(window.view.el);
  playground.appendChild(window.otherView.el);

}());
