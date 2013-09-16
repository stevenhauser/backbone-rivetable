(function(rivets) {

  // Lifted right from rivetsjs.com's homepage with a few minor tweaks.
  // http://rivetsjs.com/#configure

  rivets.configure({

    adapter: {

      subscribe: function(obj, keypath, callback) {
        this.listenTo(obj, "change:" + keypath, callback);
      },

      unsubscribe: function(obj, keypath, callback) {
        this.stopListening(obj, "change:" + keypath, callback);
      },

      read: function(obj, keypath) {
        return obj.get(keypath);
      },

      publish: function(obj, keypath, value) {
        obj.set(keypath, value);
      }

    }

  });

}(rivets));
