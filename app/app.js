import Marionette from 'marionette';
import nunjucks from 'nunjucks';
import Templates from 'app/templates/templates';
import AppLayout from 'app/layouts/AppLayout';


/**
* Replace default renderer with nunjucks
*/
Marionette.Renderer.render = function(template, data){
    console.log(data);
    debugger;
    return nunjucks.render(template, data);
};

var App = new Marionette.Application();

App.on('start', function() {
  'use strict';

  App.rootLayout = new AppLayout({el: '#main'});
  App.rootLayout.render()
});

App.start();