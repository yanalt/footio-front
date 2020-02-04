import currentIP from 'ip';
import currentPort from '../port';
var $ = require('jquery');
import axios from 'axios';

module.exports = {
  setSkins: function (skins) {
    if ($.isArray(skins)) {
      localStorage.setItem('skins', JSON.stringify(skins));
      return skins;
    }
  },
  setOwnedSkins: function (skins) {
    if ($.isArray(skins)) {
      localStorage.setItem('Ownedskins', JSON.stringify(skins));
      return skins;
    }
  },
  getCreditBalance: function () {
    return axios({
      method: 'get',
      //url:'https://nameless-island-69625.herokuapp.com/skins',
      url: window.location.protocol+'//'+currentIP+':'+currentPort+'/users/me/creditbalance',
      headers:{ 
        'x-auth': localStorage.getItem('x-auth') 
      }
    }).then(function(response) {
      return response.data;
    }).catch((e) => {
      console.log('failed response from skins');
      console.log(e);
    });
  },
  updateLastTime: function () {
    return axios({
      method: 'post',
      url: window.location.protocol+'//'+currentIP+':'+currentPort+'/users/lasttime',
      headers:{ 
        'x-auth': localStorage.getItem('x-auth') 
      }
    }).catch((e) => {
      console.log('failed response from lasttime');
      console.log(e);
    });
  },
  getCurrentSkin: function () {
    return axios({
      method: 'get',
      //url:'https://nameless-island-69625.herokuapp.com/skins',
      url: window.location.protocol+'//'+currentIP+':'+currentPort+'/users/me/currentskin',
      headers:{ 
        'x-auth': localStorage.getItem('x-auth') 
      }
    }).then(function(response) {
      return response.data;
    }).catch((e) => {
      console.log('failed response from skins');
      console.log(e);
    });
  },
  getSkins: function () {
    let skins = [];
    return axios({
      method: 'get',
      //url:'https://nameless-island-69625.herokuapp.com/skins',
      url: window.location.protocol+'//'+currentIP+':'+currentPort+'/skins',
      headers:{ 
        'x-auth': localStorage.getItem('x-auth') 
      }
    }).then(function(response) {
      skins = $.extend(true, [], response.data.skins);
      console.log('successful response from skins');
    }).then(() => {
      return skins;
    }).catch((e) => {
      console.log('failed response from skins');
      console.log(e);
    });
  },
  getRooms: function () {
    let rooms = [];
    return axios({
      method: 'get',
      //url:'https://nameless-island-69625.herokuapp.com/skins',
      url: window.location.protocol+'//'+currentIP+':'+currentPort+'/rooms'
    }).then(function(response) {
      rooms = response.data;
      console.log('successful response from skins');
    }).then(() => {
      return rooms;
    }).catch((e) => {
      console.log('failed response from skins');
      console.log(e);
    });
  },
  getOwnedSkins: function () {
    let skins = [];
    return axios({
      method: 'get',
      //url:'https://nameless-island-69625.herokuapp.com/skins',
      url: window.location.protocol+'//'+currentIP+':'+currentPort+'/users/me/skins',
      headers:{ 
        'x-auth': localStorage.getItem('x-auth') 
      }
    }).then(function(response) {
      skins = $.extend(true, [], response.data);
      console.log('successful response from skins');
    }).then(() => {
      return skins;
    }).catch((e) => {
      console.log('failed response from skins');
      console.log(e);
    });
  },
  filterSkins: function (skins, showCompleted, searchText) {
    var filteredSkins = skins;


    // Filter by searchText
    filteredSkins = filteredSkins.filter((skin) => {
      if(skin!=undefined){
        var name = skin.name.toLowerCase();
        return searchText.length === 0 || name.indexOf(searchText) > -1;
      }
    });

    

    return filteredSkins;
  }
};
