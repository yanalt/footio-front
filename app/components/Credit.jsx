import currentIP from 'ip';
import currentPort from '../port';
import '../styles/styles.css';
var React = require('react');
var moment = require('moment');
const axios = require('axios');

var SkinAPI = require('SkinAPI');


var Credit = React.createClass({
  getInitialState: function () {
    return {
      creditBalance: null
    };
  },

  handleCreditPurchase: function(e){
    axios({
      method: 'post',
      url: window.location.protocol+'//'+currentIP+':'+currentPort+'/pay',
      headers:{ 
        'x-auth': localStorage.getItem('x-auth') 
      },
      data: {
        type : e.target.id
      }
    }).then(function(response){
        console.log(response);
        if(response!=undefined&&response!=null){
          window.location.href=response.data.link;
        }
    }).catch((e)=>{
        console.log(e);
    });
  },
  
  render: function () {
    if(!localStorage.getItem('x-auth')){
      window.location.hash='#/login';
    } else {
      if(!this.state.creditBalance){
        SkinAPI.getCreditBalance().then(creditBalance=>{
          this.setState({ creditBalance });
        });
      }
      let inputStyle={}, buttonTags="button expanded";
      if(window.orientation!='undefined'&&window.orientation!=undefined){
          inputStyle={fontSize: '500%', height:100};
          buttonTags="button large expanded";
      }
      return (
        <div>
          <h2 className="page-title">Get credit coins!</h2>
          <div className="column small-centered small-11 medium-6 large-5">Credit: {this.state.creditBalance}</div>
          <div className="column small-centered small-11 medium-6 large-5">By clicking the following buttons, you agree to the <a href="/EULA.html">terms of service of mund.io</a></div>
          <div className="row">
            <div className="column small-centered small-11 medium-6 large-5">
            1000 credit points: <button className={buttonTags} id="credit5" onClick={this.handleCreditPurchase}>5$ - With PayPal</button>
            </div>
          </div>
          <div className="row">
            <div className="column small-centered small-11 medium-6 large-5">
            2400 credit points: <button className={buttonTags} id="credit10" onClick={this.handleCreditPurchase}>10$ - With PayPal</button>
            </div>
          </div>
          <div className="row">
            <div className="column small-centered small-11 medium-6 large-5">
            6000 credit points: <button className={buttonTags} id="credit20" onClick={this.handleCreditPurchase}>20$ - With PayPal</button>
            </div>
          </div>
        </div>
      )
    }
   
  }
});

module.exports = Credit;
