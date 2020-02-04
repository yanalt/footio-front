var React = require('react');
var ReactDOM = require('react-dom');
var {Route, Router, IndexRoute, hashHistory} = require('react-router');

var SkinApp = require('SkinApp');
import SignUp from 'SignUp';
import Login from 'Login';
import Forgot from 'Forgot';
import Verify from 'Verify';
import Credit from 'Credit';
import Rooms from 'Rooms';


// Load foundation
$(document).foundation();

// App css
require('style!css!sass!applicationStyles');

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/">
      <Route path="skins" component={SkinApp}/>
      <Route path="signup" component={SignUp}/>
      <Route path="forgot" component={Forgot}/>
      <Route path="verify" component={Verify}/>
      <Route path="credit" component={Credit}/>
      <Route path="rooms" component={Rooms}/>
      <IndexRoute component={Login}/>
    </Route>
  </Router>,
  document.getElementById('app')
);
