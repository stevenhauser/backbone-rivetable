(function(rivets) {

  // Lifted right from rivetsjs.com's homepage with a few minor tweaks.
  // http://rivetsjs.com/#configure

  rivets.configure({

    prefix: "rv",

    adapter: {

      subscribe: function(obj, keypath, callback) {
        obj.on("change:" + keypath, callback);
      },

      unsubscribe: function(obj, keypath, callback) {
        obj.off("change:" + keypath, callback);
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
