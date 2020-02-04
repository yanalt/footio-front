var React = require('react');
var uuid = require('node-uuid');
const axios = require('axios');
import currentIP from 'ip';
import currentPort from '../port';
import AdBlockDetect from 'react-ad-block-detect';


var SkinList = require('SkinList');
var Ad = require('Ad');
var AddSkin = require('AddSkin');
var SkinSearch = require('SkinSearch');
var SkinAPI = require('SkinAPI');
var Logout = require('Logout');

var SkinApp = React.createClass({
  getInitialState: function () {
    return {
      showCompleted: false,
      searchText: '',
      OwnedsearchText: '',
      skins: [],
      Ownedskins: [],
      creditBalance: 0,
      currentSkin: null,
      skinToken: ''
    };
  },
  componentDidUpdate: function () {
    // axios({   method:'patch',   headers:{     'x-auth':
    // localStorage.getItem('x-auth')   },   url:window.location.protocol+'//localhost:'+currentPort+'/skins',
    // data:{name:name}});
    SkinAPI.setSkins(this.state.skins);
  },
  componentDidMount: function () {
    axios({
      method: 'post',
      headers: {
        'x-auth': localStorage.getItem('x-auth')
      },
      url: window.location.protocol+'//'+currentIP+':'+currentPort+'/users/skintoken'
    }).then(response=>{
      this.setState({skinToken:response.headers.skin});
    }).catch((e) => {
      console.log('failed response from skins');
      console.log(e);
    });
    SkinAPI
      .getCreditBalance()
      .then(creditBalance => {
        this.setState({creditBalance});
        if (creditBalance == null || creditBalance == undefined) {
          window.location.hash = '#/';
        }
      })
      .catch((e) => {
        console.log(e);
        window.location.hash = '#/';
      });
    SkinAPI
      .updateLastTime().catch((e)=>{ console.log(e)});
    SkinAPI
      .getSkins()
      .then(skins => {
        this.setState({skins});
      });
    SkinAPI
      .getOwnedSkins()
      .then(Ownedskins => {
        this.setState({Ownedskins});
      });
    SkinAPI
      .getCurrentSkin()
      .then(currentSkin => {
        this.setState({currentSkin});
      });
  },
  handleAddSkin: function (name) {
    axios({
      method: 'post',
      headers: {
        'x-auth': localStorage.getItem('x-auth')
      },
      url: window.location.protocol+'//'+currentIP+':'+currentPort+'/skins',
      data: {
        name: name
      }
    });
    this.setState({
      skins: [
        ...this.state.skins, {
          _id: uuid(),
          name: name
        }
      ]
    });
  },
  handleConfirm: function (skinId, price) {
    if (price <= this.state.creditBalance) {
      axios({
        method: 'post',
        headers: {
          'x-auth': localStorage.getItem('x-auth')
        },
        url: window.location.protocol+'//'+currentIP+':'+currentPort+'/users/purchase',
        data: {
          skinId
        }
      });

      SkinAPI
        .getSkins()
        .then(skins => {
          this.setState({skins});
          SkinAPI.setSkins(skins);
        });
      SkinAPI
        .getCreditBalance()
        .then(creditBalance => {
          this.setState({creditBalance});
        });
      SkinAPI
        .getCurrentSkin()
        .then(currentSkin => {
          this.setState({currentSkin});
        })
      window
        .location
        .reload();
    } else {
      document
        .getElementById('creditBalanceTitle')
        .style
        .backgroundColor = "red";
    }
  },
  handleCredit: function () {
    window.location.hash = '#/credit';
  },
  handleStart: function () {
    var nickName = this.refs.nickName.value;

      window.location.hash = '#/rooms?tbh=asd&name='+nickName+'&conf='+this.state.skinToken;

  },
  handleSearch: function (showCompleted, searchText) {
    this.setState({
      showCompleted: showCompleted,
      searchText: searchText.toLowerCase()
    });
  },
  OwnedhandleConfirm: function (skinId) {
    axios({
      method: 'post',
      headers: {
        'x-auth': localStorage.getItem('x-auth')
      },
      url: window.location.protocol+'//'+currentIP+':'+currentPort+'/users/skinpick',
      data: {
        skinId
      }
    });
    SkinAPI
      .getCurrentSkin()
      .then(currentSkin => {
        this.setState({currentSkin});
      })
      .then(() => {
        window
          .location
          .reload();
      })
      .catch((e) => {
        console.log(e);
      });
  },
  OwnedhandleSearch: function (showCompleted, searchText) { //make this
    this.setState({
      showCompleted: showCompleted,
      searchText: searchText.toLowerCase()
    });
  },
  render: function () {

    if (!localStorage.getItem('x-auth')) {
      window.location.hash = '#/login';
    } else {
      var {
        skins,
        showCompleted,
        searchText,
        Ownedskins,
        OwnedsearchText,
        creditBalance,
        currentSkin
      } = this.state;
      var ActualOwnedSkins = skins.map((skin) => {
        for (let i = 0; i < Ownedskins.length; i++) {
          if (Ownedskins[i].skinId == skin._id) {
            skin.Owned = true;
            return skin;
          }
        }
      });
      var ActualSkins = skins.map((skin) => {
        for (let i = 0; i < Ownedskins.length; i++) {
          if (Ownedskins[i].skinId == skin._id) 
            return null;
          }
        return skin;
      });

      // console.log(ActualOwnedSkins);

      var filteredSkins = SkinAPI.filterSkins(ActualSkins, showCompleted, searchText);
      var OwnedfilteredSkins = SkinAPI.filterSkins(ActualOwnedSkins, showCompleted, searchText); //make this

      //console.log(currentSkin);
      let inputStyle={}, buttonTags="button expanded";
      if(window.orientation!='undefined'&&window.orientation!=undefined){
          inputStyle={fontSize: '500%', height:100};
          buttonTags="button large expanded";
      }
      return (
        <div>
          <div className="row">
            <div className="column">
              <Logout/>
            </div>
            <div className="column">
              <AdBlockDetect>
                <div className="column small-centered medium-centered large-centered small-11 medium-6 large-5">
                  <p>I only use one ad per page. Consider whitelisting me on your Adblocker. If the ads are intrusive please contact me and feel free to remove me from the whitelist.</p>
                </div>
              </AdBlockDetect>
            </div>
          </div>
          <div className="row">
            <div className="column small-centered medium-centered large-centered small-11 medium-6 large-5">
            <br/><br/>
                <input ref="nickName" type="text" placeholder="Nickname"/>
                <button className={buttonTags} id="start" onClick={this.handleStart}>START GAME ⚽</button>
              
            </div>
          </div>
          <h2 className="page-title">Owned Skins</h2>
          <div className="row">
            <div className="column small-centered medium-centered large-centered small-11 medium-6 large-5">
              <button
                className={buttonTags}
                id="hide"
                onClick={() => {
                document
                  .getElementById('owned')
                  .style
                  .display = "none";
                document
                  .getElementById('unhide')
                  .style
                  .display = "inline";
                document
                  .getElementById('hide')
                  .style
                  .display = "none";
              }}>Hide owned skins</button>
              <button
                className={buttonTags}
                id="unhide"
                style={{
                display: "none"
              }}
                onClick={() => {
                document
                  .getElementById('owned')
                  .style
                  .display = "block";
                document
                  .getElementById('unhide')
                  .style
                  .display = "none";
                document
                  .getElementById('hide')
                  .style
                  .display = "inline";
              }}>Unhide owned skins</button>
            </div>
          </div>
          <div className="row" id="owned">
            <div className="column small-centered small-11 medium-6 large-5">
              <div className="container">
                <SkinSearch onSearch={this.OwnedhandleSearch}/>
                <SkinList skins={OwnedfilteredSkins} current={currentSkin} onConfirm={this.OwnedhandleConfirm}/>
              </div>
            </div>
          </div>
          <h2 className="page-title">Skin Shop</h2>
          <div
            className="column small-centered small-11 medium-6 large-5"
            id="creditBalanceTitle">
            Credit: {creditBalance}
            <button className={buttonTags} id="credit" onClick={this.handleCredit}>Get more credit!</button>
          </div>

          <div className="row">
            <div className="column small-centered small-11 medium-6 large-5">
              <div className="container">
                <SkinSearch onSearch={this.handleSearch}/>
                <SkinList skins={filteredSkins} onConfirm={this.handleConfirm}/>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
});

module.exports = SkinApp;
