module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON("package.json"),

    jshint: {
      files: ["Gruntfile.js", "src/**/*.js", "spec/**/*.js"],
      options: {
        expr: true
      }
    },

    jasmine: {
      main: {
        src: "src/*.js",
        options: {
          specs: "spec/*.js",
          vendor: [
            "vendor/jquery.js",
            "vendor/underscore.js",
            "vendor/backbone.js",
            "vendor/rivets.js"
          ]
        }
      }
    },

    watch: {
      files: ["<%= jshint.files %>"],
      tasks: ["spec"]
    }

  });


  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-jasmine");
  grunt.loadNpmTasks("grunt-contrib-watch");


  grunt.registerTask("spec", ["jshint", "jasmine:main"]);
  grunt.registerTask("default", ["jshint", "jasmine:main", "watch"]);

};
