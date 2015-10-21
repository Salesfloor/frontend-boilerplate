import Marionette from 'marionette';
import { Header } from 'app/components';

export default class Page extends Marionette.LayoutView {
  constructor(...rest) {
    super(...rest);
    this.template = "components/main/main.html";
  }

  onRender () {
    this.header = new Header({el: '#header'});
    this.header.render();
  }
}