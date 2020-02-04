var React = require('react');
var uuid = require('node-uuid');
const axios = require('axios');
import currentIP from 'ip';
import Ad from 'Ad';

// var SkinList = require('SkinList');
// var AddSkin = require('AddSkin');
// var SkinSearch = require('SkinSearch');
var SkinAPI = require('SkinAPI');
var Logout = require('Logout');

// let server.js read the capacity json, and send here via axios

//CHANGE THIS ENTIRE FILE TO INCLUDE ONLY A "LOADING" SIGN, AND AN ALGORITHM TO ASSIGN USER TO A GAME

var Rooms = React.createClass({
  getInitialState: function () {
    return {
      rooms: [],
      searchParams: {}
    };
  },
  componentDidMount: function () {
    this.state.searchParams= new URLSearchParams(window.location.href);
    SkinAPI
      .getRooms()
      .then(rooms => {
        this.setState({rooms});
      });
  },
  render: function () {
    var redirect = () => {
      if(this.state.rooms){
        for(let i = 0; i < this.state.rooms.length; i++){
          if(this.state.rooms[i].players<20){
            console.log(i);

              var searchParams = this.state.searchParams;
              setTimeout(()=>{ window.location.href=window.location.protocol+'//' + currentIP + ':' + this.state.rooms[i].id + '?tbh=asd&conf='+searchParams.get('conf')+"&name="+searchParams.get('name'); },6000);
            
            break;
          }
        }
      }
    };
    var renderRooms = () => {
      var searchParams = this.state.searchParams;
      return this.state.rooms.map((room) => {
        return (
          <div className="row">
            <a href={window.location.protocol+'//'+currentIP+':'+room.id+ '?tbh=asd&conf='+searchParams.get('conf')+"&name="+searchParams.get('name')}>Room {room.id} - {room.players} players</a>
          </div>
        );
      });
    };
    if (!localStorage.getItem('x-auth')) {
      return (
        <div>
          <div>
            <h1 className="page-title">Auto assigning...</h1>
            <h3 className="page-title">Press 'w' to pass/kick the ball</h3>
            <h3 className="page-title">Press 'e' or left click to sprint without the ball</h3>
            <h3 className="page-title">For phone and tablet users: use the left circle to navigate, middle circle to sprint, and right circle to kick</h3>
            <h3 className="page-title">Holding the kick button increases the strength of the shot</h3>
            {redirect() }
          </div>
          <div className="column small-centered small-11 medium-6 large-5">
          <h1>Room list:</h1>
            {renderRooms()}
          </div>
        <div>
        </div>
        </div>
      )
    } else {

        return (
          <div>
            <Logout/>
            <div>
              <h1 className="page-title">Auto assigning...</h1>
              <h3 className="page-title">Press 'W' or right click to pass/kick the ball</h3>
              <h3 className="page-title">Press 'E' or left click to sprint without the ball</h3>
              <h3 className="page-title">For phone and tablet users: use the left circle to navigate, middle circle to sprint, and right circle to kick</h3>
              <h3 className="page-title">Holding the kick button increases the strength of the shot</h3>
            {redirect() }
            </div>
            <div className="column small-centered small-11 medium-6 large-5">
            <h1>Room list:</h1>
              {renderRooms()}
            </div>
          <div>
          </div>
          </div>
        )
    }
  }
});

module.exports = Rooms;
