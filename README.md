# backbone.rivetable

Implements live data-binding between Backbone models and views via [Rivets.js](1)

## How it works

Rivetable creates a proxy model between a Backbone view and its real model.
The proxy model listens to changes on the real model and automatically updates
its own properties to reflect those of the real model. It also serves as a
place to create computed properties or view-related methods that are useful for 
the view but not the model itself, preventing the need to pollute models with 
view-related data or methods. The properties on the proxy model are then used 
within Rivets templates, which automatically update the DOM.

## How to use it

## Configuration


[1]: http://rivetsjs.com/
