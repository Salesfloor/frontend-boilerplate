import Marionette from 'marionette';
import {route} from 'app/utils/backbone-props';


export default class Router extends Marionette.AppRouter {

    @route('rep-onboarding')
    onBoarding() {
        $('body .container').hide();
        $('body').append('Welcome to the future');
        console.log('im here');
    }
}
