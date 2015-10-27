/*eslint-env node */

module.exports = function(grunt) {
  "use strict";

  var tsConfig = {
    app: {
      tsconfig: "./src/app"
    },
    test: {
      tsconfig: "./test/app"
    }
  };


  var concatConfig = {
    header: {
      src: ["license_header.txt", "pineapples.js"],
      dest: "pineapples.js"
    }
  };

  var tslintConfig = {
    options: {
      configuration: grunt.file.readJSON(".tslintrc")
    },
    all: {
      src: ["src/**/*.ts", "test/**/*.ts"]
    }
  };

  var karmaConfig = {
    unit: {
      configFile: "karma.conf.js"
    },
    allbrowser: {
      configFile: "karma.conf.js",
      browsers: ['Chrome', 'PhantomJS', 'Firefox']
    }
  };
  var watchConfig = {
    //run unit tests with karma (server needs to be already running)
    karma: {
      files: ['pineapples.js', 'test/app/tests.js'],
      tasks: ["karma:unit:run"] //NOTE the :run flag
    },
    test: {
      files: ['pineapples.js', 'test/app/**/*.ts'],
      tasks: ["ts:test"] //NOTE the :run flag
    },

  };
  var iisConfig = {
    server: {
      options: {
        port: 53400,
        open: true,
        openPath: '/quicktests/index.html',
        killOnExit: false,
        killOn: "iis.done"
      }
    }
  };

  var openConfig = {
    tests: {
      path: "http://localhost:53400/quicktests/index.html",
      app: "Google Chrome"
    }
  };
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    concat: concatConfig,
    ts: tsConfig,
    tslint: tslintConfig,
    karma: karmaConfig,
    watch: watchConfig,
    iisexpress: iisConfig,
    open: openConfig
  });
  grunt.registerTask("iisexpress-kill", function () {
    grunt.event.emit("iis.done");
  });
  // Loads the tasks specified in package.json
  require("load-grunt-tasks")(grunt);

  grunt.registerTask("karma_start", ["karma:unit", "watch:karma"]);
  grunt.registerTask("karma_run", ["karma:unit:run"]);
  grunt.registerTask("karma_allbrowser_run", ["karma:allbrowser:run"]);
  grunt.registerTask("test-compile", ["ts:test"]);

  grunt.registerTask("test-compile", ["ts:test"]);
  grunt.registerTask("src-compile", ["ts:app", "generateJS"]);

  grunt.registerTask("dev-compile", [
    "src-compile",
    "test-compile",
    "update-quicktests"
  ]);

  grunt.registerTask("generateJS", [
    "concat:header",
    "sed:versionNumber"
  ]);

  grunt.registerTask("release:patch", ["bump:patch", "dist-compile", "gitcommit:version"]);
  grunt.registerTask("release:minor", ["bump:minor", "dist-compile", "gitcommit:version"]);
  grunt.registerTask("release:major", ["bump:major", "dist-compile", "gitcommit:version"]);

  grunt.registerTask("dist-compile", ["test", "uglify", "compress"]);

  grunt.registerTask("commitjs", ["dist-compile", "gitcommit:built"]);
  grunt.registerTask("default", ["connect", "dev-compile", "watch-silent"]);

  grunt.registerTask("test", ["dev-compile", "test-local"]);
  grunt.registerTask("test-local", ["blanket_mocha", "ts:verifyDefinitionFiles", "lint"]);
  grunt.registerTask("test-sauce", ["connect", "saucelabs-mocha"]);

  grunt.registerTask("watch-silent", function() {
    // Surpresses the "Running 'foo' task" messages
    grunt.log.header = function() {};
    grunt.task.run(["watch"]);
  });

  grunt.registerTask("lint", ["parallelize:tslint", "jscs", "eslint"]);


  grunt.registerTask("update-quicktests", function() {
    var qtJSON = [];
    var rawtests = grunt.file.expand("quicktests/overlaying/tests/**/*.js");
    rawtests.forEach(function(value) {
      qtJSON.push({ path: value });
    });
    qtJSON = JSON.stringify(qtJSON);
    qtJSON = qtJSON.split(",").join(",\n") + "\n";
    grunt.file.write("quicktests/overlaying/list_of_quicktests.json", qtJSON);
  });

};
