import Backbone from 'backbone';
import Marionette from 'marionette';
import nunjucks from 'nunjucks';
import Templates from 'app/templates/templates';
import AppLayout from 'app/layouts/AppLayout';
import Router from 'app/router'

/**
* Replace default renderer with nunjucks
*/
Marionette.Renderer.render = function(template, data){
    console.log(data);
    return nunjucks.render(template, data);
};

var App = new Marionette.Application();

App.on('start', function() {
  'use strict';
  App.router = new Router();
  Backbone.history.start();
  console.log(App.router)
  App.rootLayout = new AppLayout({el: '#main'});
  App.rootLayout.render()

});

App.start();