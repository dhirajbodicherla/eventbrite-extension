module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    react: {
      options: {
        harmony: true
      },
      single_file_output: {
        files: {
          'extension/js/script.js': 'extension/js/script.jsx'
        }
      }
    },

    concat: {
      options: {
        separator: ';',
      },
      prod: {
        src: ['extension/js/libs/jquery/dist/jquery.min.js',
              'extension/js/libs/moment/min/moment.min.js',
              'extension/js/libs/typeahead.bundle.min/index.js',
              'extension/js/libs/react/react.min.js'],
        dest: 'extension/js/vendors.js',
      },
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        },
      },
      with_overrides: {
        options: {
          curly: false,
          undef: true,
        },
        files: {
          src: ['js/application.js']
        },
      }
    },

    uglify: {
      build: {
        src: 'extension/js/script.js',
        dest: 'extension/js/script.min.js'
      }
    },

    less: {
      dist:{
        options: {
          compress: false,
          yuicompress: false,
          optimization: 2,
          modifyVars: {
            assetsLocation: '"/"'
          }
        },
        files: {
          'dist/css/home.css': 'css/home.less'
        }
      }
    },

    sprite:{
      all: {
        src: 'extension/img/*.png',
        dest: 'extension/img/spritesheet.png',
        destCss: 'extension/stylesheet/sprites.css'
      }
    },

    watch: {
      files: ['extension/js/script.jsx'],
      tasks: ['react']
    },

    processhtml: {
      dev: {
        options: {
          data: {
            message: 'This is development environment'
          }
        },
        files: {
          'extension/popup.html': ['tpl/dev.index.html']
        }
      },
      prod: {
        options: {
          process: true,
          data: {
            message: 'This is production distribution'
          }
        },
        files: {
          'extension/popup.html': ['tpl/prod.index.html']
        }
      }
    },

    clean: {
      prod: {
        src: ["extension/js/libs"]
      }
    },

    copy: {
      dev: {
        files: [
          {
            cwd: 'js',
            src: ['**/*'],
            dest: 'extension/js/',
            expand: true
          }
        ]
      }
    }

  });

  /*
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  */
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-spritesmith');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-react');

  grunt.registerTask('dev', ['processhtml:dev', 'copy:dev']);
  grunt.registerTask('test', ['react', 'concat:prod']);
  grunt.registerTask('prod', ['react', 'concat:prod', 'uglify', 'clean:prod', 'processhtml:prod']);

};