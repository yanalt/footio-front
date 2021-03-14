var React = require('react');
const axios = require('axios');
import '../styles/styles.css';

// var SkinList = require('SkinList');
// var AddSkin = require('AddSkin');
// var SkinSearch = require('SkinSearch');
let protocoL = 'http://';

// let server.js read the capacity json, and send here via axios

// CHANGE THIS ENTIRE FILE TO INCLUDE ONLY A "LOADING" SIGN, AND AN ALGORITHM TO ASSIGN USER TO A GAME

var Rooms = React.createClass({
    getInitialState: function () {
        return {rooms: [], searchParams: {}, name: 'anon', skinToken: ''};
    },
    componentDidMount: function() {
        let address = '';

        if ((window.location.href).search('localhost')!=-1||(window.location.href).search('10.0.0')!=-1) 
            address = 'http://10.0.0.11:3000';
        else{
                address = 'https://footio.com.de';
                protocoL = 'https://';
            }

        let xauth = localStorage.getItem('x-auth');
        if (xauth){
            axios({
                headers: {
                    'x-auth': xauth
                },
                method: 'post',
                url: address + '/users/skintoken'
            }).then(response => {
                if (response.headers.skin) {
                    this.setState({skinToken: response.headers.skin});
                }
            }).catch((e) => {
                console.log(e);
            });
        }

        axios({
            method: 'get',
            url: address + '/roomStats'
        }).then(response => {
            if (Array.isArray(response.data.rooms)) {
                response.data.rooms.sort((a, b) => {
                    return a.playerAmount < b.playerAmount
                });
                this.setState({rooms: response.data.rooms});
            }
            console.log(response.data.rooms);
        }).catch((e) => {
            console.log(e);
        });
    },
    handleName: function() {
        this.setState({name:this.refs.nameInput.value});
        console.log(this.refs.nameInput.value);
    },
    render: function () {
        var redirect = () => {
            
        };
        var renderRooms = () => {
            return this.state.rooms.map((room) => {
                let url = room.ip+':'+room.port;
                if(room.ip=='localhost')
                    url = '10.0.0.11'+':'+room.port;
                return (
                    <div>
                        <a href={url + '?asd=qwe'+'&name='+ this.state.name+'&conf='+this.state.skinToken}>
                            { room.location } { room.port } -  { room.difficulty } - { room.playerAmount }/{ room.playerMax }
                        </a>
                    </div>
                );
            });
        };

        // if (!localStorage.getItem('x-auth')) {
        //     return (
        //         <div>
        //             <div>
        //                 <h1 className="page-title">Auto assigning...</h1>
        //                 <h3 className="page-title">Use 🕹 to navigate, 🏃 to sprint, and ⚽ to kick</h3>
        //                 <h3 className="page-title">Holding ⚽ increases the strength of the shot</h3>
        //                 {
        //                 redirect()
        //             } </div>
        //             <div className="column small-centered small-11 medium-6 large-5">
        //                 <h1>Room list:</h1>
        //                 {
        //                 renderRooms()
        //             } </div>
        //             <div></div>
        //         </div>
        //     )
        // } else {

            return (
                <div>
                    <table width="100%">
                        <tr>
                            <td style={{alignItems:'center'}}>

                                <div>
                                    <h1>ROOM LIST</h1>
                                    <h3 style={{color:'red'}}>Use mouse or 🕹 to navigate, left click or 🏃 to sprint, and right click or ⚽ to kick</h3>
                                    <h3 style={{color:'red'}}>Holding right click or ⚽ increases the strength of the shot</h3>
                                    {
                                    redirect()
                                    } 
                                </div>

                                <div>
                                    <input ref="nameInput" onChange={this.handleName} type="text" placeholder="insert nickname" />
                                    (only alphabetic with no spaces, please be nice :) )
                                </div>

                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1>Room list:</h1>
                                {
                                renderRooms()
                                } 
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <a href="https://play.google.com/store/apps/details?id=com.timsa7.mundmobile" ><img src="/img/androidBig.png" height="18%" /></a>
                                <a href="https://apps.apple.com/us/app/footio/id1556001662"><img src="/img/iosBig.png" height="18%"  /></a>
                            </td>  
                        </tr>
                    </table>
                </div>
            )
        // }
    }
});

module.exports = Rooms;
