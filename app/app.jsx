var React = require('react');
var ReactDOM = require('react-dom');
var {Route, Router, IndexRoute, hashHistory} = require('react-router');

import Login from 'Login';
import Rooms from 'Rooms';


// Load foundation
// $(document).foundation();

// App css
// require('style!css!sass!applicationStyles');

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/">
      <Route path="rooms" component={Rooms}/>
      <IndexRoute component={Login}/>
    </Route>
  </Router>,
  document.getElementById('app')
);
