import currentIP from 'ip';
import currentPort from '../port';
var React = require('react');
const axios = require('axios');

var Ad = React.createClass({
//   handleLogout: function() {
//     axios({
//       method: 'delete',
//       headers: {
//         'x-auth': localStorage.getItem('x-auth')
//       },
//       url: window.location.protocol+'//'+currentIP+':'+currentPort+'/users/me/token',
//     });
//     window.location.hash = '#/';
//   },
  componentDidMount(){
    (adsbygoogle = window.adsbygoogle || []).push({
      google_ad_client: "ca-pub-2084501738226097",
      enable_page_level_ads: true
    });
  },
  render: function () {

    return (
      <div id="ads-wrapper" className="column small-centered small-11 medium-6 large-5">
        <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
      </div>
    )
  }
});

module.exports = Ad;
