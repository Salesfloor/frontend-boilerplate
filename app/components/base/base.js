import Marionette from 'marionette';

export default class Base extends Marionette.ItemView {
  constructor(...rest) {
    super(...rest);
    this.template = "components/base/base.html";
  }
}