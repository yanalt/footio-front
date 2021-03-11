import currentIP from 'ip';
import currentPort from '../port';
import React from 'react';
import axios from 'axios';
import '../styles/styles.css';
//import 'whatwg-fetch';

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
        let inputStyle={}, buttonTags="button expanded";
        if(window.orientation!='undefined'&&window.orientation!=undefined){
            inputStyle={fontSize: '500%', height:100};
            buttonTags="button large expanded";
        }
        return (
            <div>
                <h1 className="page-title">FOOTIO</h1>
                <div className="row">
                    <div className="columns small-centered medium-centered large-centered small-10 medium-6 large-4">
                        <div className="container__footer">
                            <form onSubmit={this.handleSubmit}>
                                These can be found in the "sign out" section in the mobile app.
                                <input type="text" style={inputStyle} ref="loginEmail" placeholder="Your mobile ID"/>
                                <input type="password" style={inputStyle} ref="loginPassword" placeholder="Your mobile code"/>
                                <button onTouchEnd={this.handleSubmit} className={buttonTags}>Login</button>
                                <div ref="errorTitle"></div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="columns small-centered medium-centered large-centered small-10 medium-6 large-4">
                        <div className="container__footer">
                            <button className={buttonTags} onTouchEnd={this.handleGuest} onClick={this.handleGuest}>Play as a guest! ⚽</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
})

export default Login;