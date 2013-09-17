(function() {

  var Model = Backbone.Model.extend({}),

      ProxyModel = Backbone.RivetableProxyModel.extend({
        fullName: function() {
          return [this.get("firstName"), this.get("lastName")].join(" ");
        }
      });

      View = Backbone.RivetableView.extend({
        rivetableModel: ProxyModel
      });


  window.model = new Model({
    firstName: "Annyong",
    lastName: "Bluth",
    title: "adopted child",
    description: "saboteur"
  });

  window.view = new View({
    model: window.model,
    el: "#template"
  });

  console.log( window.view );
  console.log( window.model );

}());
