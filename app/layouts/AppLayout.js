import Marionette from 'marionette';
import Header from 'app/components/header/header';

export default class AppLayout extends Marionette.LayoutView {
  constructor(...rest) {
    super(...rest);
    this.template = "components/main/main.html";
  }

  onRender () {
    this.header = new Header({el: '#header'});
    this.header.render();
  }
}