(function($, Backbone, _) {

  var rivetable = {
    rivetable: function() {
      console.log( "Hello, I'm rivetable" );
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

}(jQuery, Backbone, _));
