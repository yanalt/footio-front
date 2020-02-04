import currentIP from 'ip';
import currentPort from '../port';
import React from 'react';
import axios from 'axios';
import Ad from 'Ad';
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
                    localStorage.setItem('x-auth',response.headers['x-auth']);
                    window.location.hash='#/skins';
            }).catch((e)=>{
                console.log(e);
                if(e.status==400||e.status==404){
                    if(this.refs.errorTitle.firstChild)
                        this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                    this.refs.errorTitle.appendChild(document.createTextNode("The provided email and password don't match!"));
                }
            });
        } else {
            if (loginPassword.length === 0) {
                this.refs.loginPassword.focus();
                if(this.refs.errorTitle.firstChild)
                    this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                this.refs.errorTitle.appendChild(document.createTextNode("Please type your password!"));
            }
            if (loginEmail.length === 0) {
                this.refs.loginEmail.focus();
                if(this.refs.errorTitle.firstChild)
                    this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                this.refs.errorTitle.appendChild(document.createTextNode("Please type your email!"));
            }
        }
    },
    handleSignup: function (e) {
        e.preventDefault();
        window.location.hash='#/signup';
    },
    handleForgot: function (e) {
        e.preventDefault();
        var loginEmail = this.refs.loginEmail.value;

        if (loginEmail.length > 0) {
            axios({
                method: 'post',
                //url:'https://nameless-island-69625.herokuapp.com/login',
                url: window.location.protocol+'//'+currentIP+':'+currentPort+'/forgot',
                data:{
                    email: loginEmail,
                }
            }).then(function(response){
                    localStorage.setItem('x-auth',response.headers['x-auth']);
                    window.location.hash='#/forgot';
            }).catch((e)=>{
                console.log(e);
                if(e.status==400||e.status==404){
                    if(this.refs.errorTitle.firstChild)
                        this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                    this.refs.errorTitle.appendChild(document.createTextNode("The provided email is not registered!"));
                }
            });
        }
            if (loginEmail.length === 0) {
                this.refs.loginEmail.focus();
                if(this.refs.errorTitle.firstChild)
                    this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                this.refs.errorTitle.appendChild(document.createTextNode("Please type your email!"));
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
                window.location.hash='#/skins';
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
                <h1 className="page-title">MUND</h1>
                <div className="row">
                    <div className="columns small-centered medium-centered large-centered small-10 medium-6 large-4">
                        <div className="container__footer">
                            <form onSubmit={this.handleSubmit}>
                                <input type="text" style={inputStyle} ref="loginEmail" placeholder="Your email"/>
                                <input type="password" style={inputStyle} ref="loginPassword" placeholder="Your password"/>
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
                            <button className={buttonTags} onTouchEnd={this.handleSignup} onClick={this.handleSignup}>Sign up!</button>
                            <button className={buttonTags} onTouchEnd={this.handleForgot} onClick={this.handleForgot}>I forgot my password...</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
})

export default Login;