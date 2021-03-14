import React from 'react';
import axios from 'axios';
import '../styles/styles.css';

let currentIP = window.location.hostname;
let currentPort = 443;
if((currentIP).search('10.0.0')!=-1||(currentIP).search('localhost')!=-1)
    currentPort = 3000;

export var Login = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();
        var loginEmail = this.refs.loginEmail.value;
        var loginPassword = this.refs.loginPassword.value;
        if (loginEmail.length > 0 && loginPassword.length > 0) {
            axios({
                method: 'post',
                url: window.location.protocol+'//'+currentIP+':'+currentPort+'/users/login',
                data:{
                    email: loginEmail,
                    password: loginPassword
                }
            }).then(function(response){
                    console.log(response.headers['x-auth']);
                    localStorage.setItem('x-auth',response.headers['x-auth']);
                    window.location.hash='#/rooms';
            }).catch((e)=>{
                console.log(e);
                if(e.status==400||e.status==404){
                    if(this.refs.errorTitle.firstChild)
                        this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                    this.refs.errorTitle.appendChild(document.createTextNode("The provided ID and code don't match!"));
                }
            });
        } else {
            if (loginPassword.length === 0) {
                this.refs.loginPassword.focus();
                if(this.refs.errorTitle.firstChild)
                    this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                this.refs.errorTitle.appendChild(document.createTextNode("Please type your code!"));
            }
            if (loginEmail.length === 0) {
                this.refs.loginEmail.focus();
                if(this.refs.errorTitle.firstChild)
                    this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                this.refs.errorTitle.appendChild(document.createTextNode("Please type your ID!"));
            }
        }
    },
    handleGuest: function (e) {
        e.preventDefault();
        window.location.hash='#/rooms';
    },
    checkLoggedIn: function() {
        axios({
            method: 'get',
            //url:'https://nameless-island-69625.herokuapp.com/login',
            url: window.location.protocol+'//'+currentIP+':'+currentPort+'/users/me/creditbalance',
            headers:{ 
              'x-auth': localStorage.getItem('x-auth') 
            }
        }).then(function(response){
            if(response!=undefined&&response!=null)
                window.location.hash='#/rooms';
        }).catch((e)=>{
            console.log(e);
        });
    },
    render(){

        if(localStorage.getItem('x-auth')){
            
            this.checkLoggedIn();
        }
        let inputStyle={}, h1Style={}, buttonStyle={}, imgHeight='';
        let isDesktop = false;
        if(window.orientation!='undefined'&&window.orientation!=undefined){
            inputStyle={fontSize: '500%', height:100};
            h1Style={fontSize: '500%'};
            buttonStyle={fontSize: '500%'};
            imgHeight='40%';
        }else{
            isDesktop = true;
        }
        if(!isDesktop){
            return (
                <div>
                    <table>
                        <tr>
                            <td>
                                <h1 style={h1Style} className="page-title">FOOTIO</h1>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1 style={h1Style}>Android: (click/scan)</h1>
                                <a href="https://play.google.com/store/apps/details?id=com.timsa7.mundmobile" ><img src="/img/androidBig.png" height={imgHeight}/></a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1 style={h1Style}>iOS: (click/scan)</h1>
                                <a href="https://apps.apple.com/us/app/footio/id1556001662"><img src="/img/iosBig.png" height={imgHeight}/></a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1 style={h1Style}>Web:</h1>
                                <button style={buttonStyle} onTouchEnd={this.handleGuest} onClick={this.handleGuest}>Play as a guest! ⚽</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1 style={h1Style}>Web: (login ID and code from mobile app)</h1>
                                <form onSubmit={this.handleSubmit}>
                                    <input type="text" style={inputStyle} ref="loginEmail" placeholder="Your ID"/>
                                    <input type="password" style={inputStyle} ref="loginPassword" placeholder="Your code"/>
                                    <button onTouchEnd={this.handleSubmit} style={buttonStyle}>Login</button>
                                    <div ref="errorTitle"></div>
                                </form>
                            </td>
                        </tr>
                    </table>
                            
                        
                </div>
            );
        }else if([
                  'iPad Simulator',
                  'iPhone Simulator',
                  'iPod Simulator',
                  'iPad',
                  'iPhone',
                  'iPod'
                ].includes(navigator.platform)
                // iPad on iOS 13 detection
                || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
              ){
            return(
                <div>
                    <table>
                        <tr>
                            <td>
                                <h1 style={h1Style} className="page-title">FOOTIO</h1>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1 style={h1Style}>iOS: (click/scan)</h1>
                                <a href="https://apps.apple.com/us/app/footio/id1556001662"><img src="/img/iosBig.png" height="10%" width="10%"/></a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1 style={h1Style}>Android: (click/scan)</h1>
                                <a href="https://play.google.com/store/apps/details?id=com.timsa7.mundmobile" ><img src="/img/androidBig.png" height="10%" width="10%"/></a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1 style={h1Style}>Web:</h1>
                                <button style={buttonStyle} onTouchEnd={this.handleGuest} onClick={this.handleGuest}>Play as a guest! ⚽</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1 style={h1Style}>Web: (login ID and code from mobile app)</h1>
                                <form onSubmit={this.handleSubmit}>
                                    <input type="text" style={inputStyle} ref="loginEmail" placeholder="Your ID"/>
                                    <input type="password" style={inputStyle} ref="loginPassword" placeholder="Your code"/>
                                    <button onTouchEnd={this.handleSubmit} style={buttonStyle}>Login</button>
                                    <div ref="errorTitle"></div>
                                </form>
                            </td>
                        </tr>
                    </table>
                            
                        
                </div>
            );
        }else{
            return (
                <div>
                    <table>
                        <tr>
                            <td>
                                <h1 style={h1Style} className="page-title">FOOTIO</h1>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1 style={h1Style}>Web:</h1>
                                <button style={buttonStyle} onTouchEnd={this.handleGuest} onClick={this.handleGuest}>Play as a guest! ⚽</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1 style={h1Style}>Web: (login ID and code from mobile app)</h1>
                                <form onSubmit={this.handleSubmit}>
                                    <input type="text" style={inputStyle} ref="loginEmail" placeholder="Your ID"/>
                                    <input type="password" style={inputStyle} ref="loginPassword" placeholder="Your code"/>
                                    <button onTouchEnd={this.handleSubmit} style={buttonStyle}>Login</button>
                                    <div ref="errorTitle"></div>
                                </form>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1 style={h1Style}>Android: (click/scan)</h1>
                                <a href="https://play.google.com/store/apps/details?id=com.timsa7.mundmobile" ><img src="/img/androidBig.png" height="10%" width="10%"/></a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1 style={h1Style}>iOS: (click/scan)</h1>
                                <a href="https://apps.apple.com/us/app/footio/id1556001662"><img src="/img/iosBig.png" height="10%" width="10%"/></a>
                            </td>
                        </tr>
                    </table>
                            
                        
                </div>
            );
        }
    }
})

export default Login;