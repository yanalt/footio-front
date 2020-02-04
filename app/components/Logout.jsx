import currentIP from 'ip';
import currentPort from '../port';
var React = require('react');
const axios = require('axios');

var Logout = React.createClass({
  handleLogout: function() {
    axios({
      method: 'delete',
      headers: {
        'x-auth': localStorage.getItem('x-auth')
      },
      url: window.location.protocol+'//'+currentIP+':'+currentPort+'/users/me/token',
    });
    window.location.hash = '#/';
  },
  render: function () {

    return (
      <div className="column small-centered small-11 medium-6 large-5">
        <button className="button" onClick={this.handleLogout}>Log out</button>
      </div>
    )
  }
});

module.exports = Logout;
