import Marionette from 'marionette';

export default class Header extends Marionette.ItemView {
  constructor(...rest) {
    super(...rest);
    this.template = "components/header/header.html";
  }
}