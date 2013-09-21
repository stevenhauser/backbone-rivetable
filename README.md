# backbone.rivetable

Implements live data-binding between Backbone models and views via [Rivets.js][1].

**Note that this project is still in its early stages and is very much a work in progress.**

## How it works

Rivetable creates a proxy model between a Backbone view and its real model.
The proxy model listens to changes on the real model and automatically updates
its own properties to reflect those of the real model. It also serves as a
place to create computed properties or view-related methods that are useful for
the view but not the model itself, preventing the need to pollute models with
view-related data or methods. The properties on the proxy model are then used
within Rivets templates, which automatically update the DOM.

## How to use it

Simply call the `rivetable` method within your view to create the proxy model.
By the time `rivetable` is called, your view should have a `model` defined.
If you change your view's `model`, you'll need to recall `rivetable`.

```js
Backbone.View.extend({
  initialize: function() {
    this.render().rivetable();
  }
});
```

Alternatively, you can use `Backbone.RivetableView` to negate the need of
calling `this.rivetable`:

```js
Backbone.RivetableView.extend({
  initialize: function() {
    this.render();
    // No need to call `rivetable` here because it'll be called
    // in `RivetableView`'s constructor.
  }
});
```

### Rendering

Because backbone.rivetable uses Rivets.js behind the scenes, the view should be
rendered before calling `rivetable` so that the template is rendered within
`this.el`. If the template isn't within `this.el` by the time `rivetable` is
called, Rivets won't know what data attributes it needs to bind to.

Because of this you should always call `rivetable` after rendering. The calls
to `render` and `rivetable` should only be needed once (unless you change your
view's model) and then backbone.rivetable should handle the rest from there.
If using `RivetableView`, you should call `render` in your view's `initialize`
method since `RivetableView`'s constuctor calls `rivetable` after `initialize`.
If using rivetable as a mixin, just call it at some point after rendering.
Multiple calls to `rivetable` do clean up existing listeners and references,
so it's not problematic to call it more than once, though it shouldn't be needed.

### Customizing the proxy model

Rivetable defines a proxy model that extends `Backbone.Model`. This proxy model
listens for changes in the real model and updates its own properties to match
the real model's properties. To add custom properties or methods, simply `extend`
`Rivetable.ProxyModel` and define it as `rivetableModel` on your view.

```js
var CustomProxyModel = Rivetable.ProxyModel.extend({
  aCustomMethod: function() {
    // do something useful
  }
});

var RivetableView = Backbone.View.extend({
  rivetableModel: CustomProxyModel,
  initialize: function() {
    this.rivetable();
  }
});
```

### Turning rivetable off

When your view is destroyed, call `this.unrivetable()` to clean up any references.
In [Marionette][2], an ideal place to do this would be in a view's `onClose` method.

```js
Backbone.View.extend({
  initialize: function() {
    this.rivetable();
  },
  destroy: function() {
    this.unrivetable();
  }
});
```


[1]: http://rivetsjs.com/
[2]: http://marionettejs.com/
