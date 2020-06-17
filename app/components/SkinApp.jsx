var React = require('react');
var uuid = require('node-uuid');
const axios = require('axios');
import currentIP from 'ip';
import currentPort from '../port';
import style from '../styles/style.jsx';


var SkinList = require('SkinList');
var AddSkin = require('AddSkin');
var SkinSearch = require('SkinSearch');
var SkinAPI = require('SkinAPI');



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
      skinToken: '',
      // queryDict: ''
    };
  },
  componentDidUpdate: function () {
    // axios({   method:'patch',   headers:{     'x-auth':
    // localStorage.getItem('x-auth')   },   url:window.location.protocol+'//localhost:'+currentPort+'/skins',
    // data:{name:name}});
    SkinAPI.setSkins(this.state.skins);
  },
  componentDidMount: function () {
    // let q;
    // location.search.substr(1).split("&").forEach(function(item) {q[item.split("=")[0]] = item.split("=")[1]});
    // this.setState({queryDict:});
    // window.alert(this.props.location.query.a);
    localStorage.setItem('x-auth',this.props.location.query.a);
    axios({
      method: 'post',
      headers: {
        'x-auth': this.props.location.query.a
      },
      url: window.location.protocol+'//'+currentIP+':'+currentPort+'/users/skintoken'
    }).then(response=>{
      this.setState({skinToken:response.headers.skin});
      // window.alert(response.headers.skin);
    }).catch((e) => {
      console.log('failed response from skins');
      window.alert(e);
    });
    SkinAPI
      .getCreditBalance()
      .then(creditBalance => {
        this.setState({creditBalance});
        if (creditBalance == null || creditBalance == undefined) {
          // window.location.hash = '#/';
        }
      })
      .catch((e) => {
        window.alert(e);
      });
    SkinAPI
      .updateLastTime().catch((e)=>{ window.alert(e)});
    SkinAPI
      .getSkins()
      .then(skins => {
        this.setState({skins});
      })
      .catch((e) => {
        window.alert(e);
      });
    SkinAPI
      .getOwnedSkins()
      .then(Ownedskins => {
        this.setState({Ownedskins});
      })
      .catch((e) => {
        window.alert(e);
      });
    SkinAPI
      .getCurrentSkin()
      .then(currentSkin => {
        this.setState({currentSkin});
      })
      .catch((e) => {
        window.alert(e);
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
        })
        .catch((e) => {
          window.alert(e);
        });
      SkinAPI
        .getCreditBalance()
        .then(creditBalance => {
          this.setState({creditBalance});
        })
        .catch((e) => {
          window.alert(e);
        });
      SkinAPI
        .getCurrentSkin()
        .then(currentSkin => {
          this.setState({currentSkin});
        })
        .catch((e) => {
          window.alert(e);
        });
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
        window.alert(e);
      });
  },
  OwnedhandleSearch: function (showCompleted, searchText) { //make this
    this.setState({
      showCompleted: showCompleted,
      searchText: searchText.toLowerCase()
    });
  },
  render: function () {
    // var queryDict = {}
    // location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]});
    // if (!localStorage.getItem('x-auth')&&(queryDict[0]==undefined||queryDict[0]=="undefined"||queryDict[0]==null)) {
    //   // window.location.hash = '#/login';
    //   window.alert(queryDict[0]); //location.search doesn't appear
    //                               //location appears but you can't do anything with the get part
    // } else {
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
      // if(ActualSkins[0])
      //   window.alert(ActualSkins[0].name);

      var filteredSkins = SkinAPI.filterSkins(ActualSkins, showCompleted, searchText);
      var OwnedfilteredSkins = SkinAPI.filterSkins(ActualOwnedSkins, showCompleted, searchText); //make this

      //console.log(currentSkin);
      let inputStyle={}, buttonTags="button expanded";
      // if(window.orientation!='undefined'&&window.orientation!=undefined){
      //     inputStyle={fontSize: '500%', height:100};
      //     buttonTags="button large expanded";
      // }
      return (
        <div>
          


          <div style={{textAlign:'center'}}>
            
            <SkinSearch onSearch={this.handleSearch}/>
            <div  style={{float: 'left', width: '100%',textAlign:'center'}}
              id="creditBalanceTitle">
              <h2>Coins: {creditBalance}</h2>
            </div>
            <div style={{float: 'left', width: '40%'}}>
              <div style={{float: 'right',width: '100%'}} >
                <h2 style={{float: 'right'}} className="page-title">Unlocked Skins</h2>
              </div>
              <div style={{float: 'right'}} className="row" id="owned">
                <div className="column small-centered">
                  <div className="container">
                    {/* <SkinSearch onSearch={this.OwnedhandleSearch}/> */}
                    <SkinList skins={OwnedfilteredSkins} current={currentSkin} onConfirm={this.OwnedhandleConfirm}/>
                  </div>
                </div>
              </div>
            </div>

            <div style={{float: 'right', width: '40%'}}>
              <h2 className="page-title">Locked Skins</h2>

              <div style={{float: 'left'}} className="row">
                <div className="column small-centered small-11 medium-6 large-5">
                  <div className="container">
                    {/* <SkinSearch onSearch={this.handleSearch}/> */}
                    <SkinList skins={filteredSkins} onConfirm={this.handleConfirm}/>
                  </div>
                </div>
              </div>
            
            </div>

          </div>


        </div>
      );
    // }
  }
});

module.exports = SkinApp;
