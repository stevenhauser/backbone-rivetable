describe("backbone.rivetable", function() {

  describe("exports", function() {

    it("should attach itself to Backbone", function() {
      expect(Backbone.rivetable).toBeDefined();
    });

    it("should attach a RivetableView to Backbone", function() {
      expect(Backbone.RivetableView).toBeDefined();
    });

    it("should attach a RivetableProxyModel to Backbone", function() {
      expect(Backbone.RivetableProxyModel).toBeDefined();
    });

  });


  describe("RivetableProxyModel", function() {

    var proxyModel, model, view;

    beforeEach(function() {
      model = new Backbone.Model({ a: 1, b: 2, c: 3 });
      view = new Backbone.View({ model: model });
      proxyModel = new Backbone.RivetableProxyModel(null, { view: view });
    });

    describe("initialization", function() {

      it("stores a reference to its view", function() {
        expect(proxyModel.view).toBe(view);
      });

      it("stores a reference to the main model", function() {
        expect(proxyModel.model).toBe(model);
      });

    });

    describe("relationship to its main model", function() {

      it("copies its main model's attributes when they change", function() {
        var shouldHaveCopied = false;
        spyOn(proxyModel, "copyModelAttrs");
        runs(function() {
          model.set("a", 2);
          setTimeout(function() { shouldHaveCopied = true; }, 20);
        });
        waitsFor(function() {
          return shouldHaveCopied;
        });
        runs(function() {
          expect(proxyModel.copyModelAttrs).toHaveBeenCalled();
        });
      });

      it("copies its main model's attributes", function() {
        proxyModel.copyModelAttrs();
        expect(proxyModel.attributes).toEqual(model.attributes);
      });

    });

    describe("bidirectionality", function() {

      function setProxyModelValueAndWait(key, val, callback) {
        var shouldHaveCopied = false;
        runs(function() {
          proxyModel.set(key, val);
          setTimeout(function() { shouldHaveCopied = true; }, 20);
        });
        waitsFor(function() {
          return shouldHaveCopied;
        });
        runs(callback);
      }

      beforeEach(function() {
        spyOn(proxyModel, "copyAttrsToModel").andCallThrough();
      });

      it("is bidirectional by default", function() {
        expect(proxyModel.bidirectional).toBe(true);
      });

      describe("when bidirectional", function() {

        beforeEach(function() {
          proxyModel.bidirectional = true;
        });

        it("updates its model", function() {
          setProxyModelValueAndWait("a", "a new value", function() {
            expect(proxyModel.copyAttrsToModel).toHaveBeenCalled();
            expect(model.get("a")).toBe("a new value");
          });
        });

        it("doesn't update attributes its model doesn't have", function() {
          setProxyModelValueAndWait("z", "a new value", function() {
            expect(model.get("z")).toBeUndefined();
          });
        });

      });

      describe("when not bidirectional", function() {

        beforeEach(function() {
          proxyModel.bidirectional = false;
        });

        it("doesn't update its model", function() {
          var origVal = model.get("a");
          setProxyModelValueAndWait("a", "a new value", function() {
            expect(proxyModel.copyAttrsToModel).not.toHaveBeenCalled();
            expect(model.get("a")).not.toBe("a new value");
            expect(model.get("a")).toBe(origVal);
          });
        });

      });

    });

    describe("destruction", function() {

      it("cleans up its references", function() {
        proxyModel.destroy();
        expect(proxyModel.view).toBeNull();
        expect(proxyModel.model).toBeNull();
      });

      it("stops listening its main model's changes", function() {
        spyOn(proxyModel, "stopListening");
        proxyModel.destroy();
        expect(proxyModel.stopListening).toHaveBeenCalledWith(model);
      });

    });

  });


  describe("RivetableView", function() {

    function createRivetableView(createModel) {
      if (createModel == null) { createModel = true; }
      var model = createModel ? (new Backbone.Model()) : null;
      return new Backbone.RivetableView({ model: model });
    }

    describe("initialization", function() {

      it("calls rivetable in its constructor", function() {
        spyOn(Backbone.RivetableView.prototype, "rivetable");
        createRivetableView();
        expect(Backbone.RivetableView.prototype.rivetable).toHaveBeenCalled();
      });

      it("checks for a model", function() {
        spyOn(Backbone.RivetableView.prototype, "checkForModel").andCallThrough();
        createRivetableView();
        expect(Backbone.RivetableView.prototype.checkForModel).toHaveBeenCalled();
      });

      it("creates a proxy model", function() {
        spyOn(Backbone.RivetableView.prototype, "createProxyModel").andCallThrough();
        createRivetableView();
        expect(Backbone.RivetableView.prototype.createProxyModel).toHaveBeenCalled();
      });

      it("creates a rivets view", function() {
        spyOn(Backbone.RivetableView.prototype, "initializeRivetsView").andCallThrough();
        createRivetableView();
        expect(Backbone.RivetableView.prototype.initializeRivetsView).toHaveBeenCalled();
      });

      it("calls unrivetable when rivetable is called", function() {
        var view = createRivetableView();
        spyOn(Backbone.RivetableView.prototype, "unrivetable").andCallThrough();
        view.rivetable();
        expect(Backbone.RivetableView.prototype.unrivetable).toHaveBeenCalled();
      });

    });

    describe("checking for a model", function() {

      it("throws an error when no model is specified", function() {
        // Can't use .bind for some reason. Node doesn't support it yet?
        expect(_.partial(createRivetableView, false)).toThrow();
      });

      it("doesn't throw an error when a model is specified", function() {
        expect(createRivetableView).not.toThrow();
      });

    });

    describe("creating a proxy model", function() {

      var view;

      beforeEach(function() {
        view = createRivetableView();
      });

      it("creates a proxy model", function() {
        expect(view.proxyModel).toBeDefined();
      });

      it("uses the desired proxy model constructor", function() {
        var CustomProxy = Backbone.RivetableProxyModel.extend(),
            View = Backbone.RivetableView.extend({
              rivetableModel: CustomProxy
            }),
            view = new View({ model: new Backbone.Model() });
        expect(view.proxyModel instanceof CustomProxy).toBe(true);
      });

    });

    describe("creating a rivets view", function() {

      var view;

      beforeEach(function() {
        view = createRivetableView();
      });

      it("creates a rivets view", function() {
        spyOn(rivets, "bind");
        view.initializeRivetsView();
        expect(rivets.bind).toHaveBeenCalled();
      });

      it("stores a reference to its rivets view", function() {
        view.initializeRivetsView();
        expect(view.rivetsView).toBeDefined();
      });

      it("sets up the initial view state by copying model attributes", function() {
        spyOn(view.proxyModel, "copyModelAttrs");
        view.initializeRivetsView();
        expect(view.proxyModel.copyModelAttrs).toHaveBeenCalled();
      });

    });

    describe("destruction", function() {

      var view;

      beforeEach(function() {
        view = createRivetableView();
      });

      it("destroys its proxy model", function() {
        var proxyModel = view.proxyModel;
        spyOn(proxyModel, "destroy");
        view.unrivetable();
        expect(proxyModel.destroy).toHaveBeenCalled();
      });

      it("stops listening to its proxy model", function() {
        var proxyModel = view.proxyModel;
        spyOn(view, "stopListening");
        view.unrivetable();
        expect(view.stopListening).toHaveBeenCalledWith(proxyModel);
      });

      it("unbinds its rivets view", function() {
        var rivetsView = view.rivetsView;
        spyOn(rivetsView, "unbind");
        view.unrivetable();
        expect(rivetsView.unbind).toHaveBeenCalled();
      });

      it("cleans up its references", function() {
        view.unrivetable();
        expect(view.proxyModel).toBeNull();
        expect(view.rivetsView).toBeNull();
      });

    });

  });

});
