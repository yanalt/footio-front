import currentIP from 'ip';
import currentPort from '../port';
import React from 'react';
import axios from 'axios';
import '../styles/styles.css';
//import 'whatwg-fetch';

export var Signup = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();
        var signupEmail = this.refs.signupEmail.value;
        var signupPassword = this.refs.signupPassword.value;
        var signupPasswordC = this.refs.signupPasswordC.value;

        if (signupEmail.length > 0 && signupPassword.length > 0 && signupPasswordC.length > 0) {
            if(signupPassword===signupPasswordC){
                axios({
                    method: 'post',
                    //url:'https://nameless-island-69625.herokuapp.com/login',
                    url: window.location.protocol+'//'+currentIP+':'+currentPort+'/users',
                    data:{
                        email: signupEmail,
                        password: signupPassword,
                    }
                }).then(function(response){
                    localStorage.setItem('x-auth',response.headers['x-auth']);
                    window.location.hash='#/verify';
                }).catch((e)=>{
                    if(e.data.code==11000){
                        if(this.refs.errorTitle.firstChild)
                            this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                        this.refs.errorTitle.appendChild(document.createTextNode("Email already in use!"));
                        this.refs.signupEmail.focus();
                    } else if(e.data.name=="ValidationError"){
                        if(this.refs.errorTitle.firstChild)
                            this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                        this.refs.errorTitle.appendChild(document.createTextNode("Password must be longer than 6 characters!"));
                        this.refs.signupPassword.focus();
                    }
                });
            }else{
                if(this.refs.errorTitle.firstChild)
                    this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                this.refs.errorTitle.appendChild(document.createTextNode("Passwords must match!"));
                this.refs.signupPasswordC.focus();
            }
        } else {
            if (signupPassword.length === 0) {
                if(this.refs.errorTitle.firstChild)
                    this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                this.refs.errorTitle.appendChild(document.createTextNode("Please enter a password!"));
                this.refs.signupPassword.focus();
            }
            if (signupEmail.length === 0) {
                if(this.refs.errorTitle.firstChild)
                    this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                this.refs.errorTitle.appendChild(document.createTextNode("Please enter an email!"));
                this.refs.signupEmail.focus();
            }
        }
    },
    render(){
        let inputStyle={}, buttonTags="button expanded";
        if(window.orientation!='undefined'&&window.orientation!=undefined){
            inputStyle={fontSize: '500%', height:100};
            buttonTags="button large expanded";
        }
        return (
            <div>
                <h2 className="page-title">MUND - Sign up!</h2>
                <div className="row">
                    <div className="columns small-centered small-10 medium-6 large-4">
                        <div className="container__footer">
                            <form onSubmit={this.handleSubmit}>
                                Email: <input type="text" style={inputStyle} ref="signupEmail" placeholder="Your email"/>
                                Password: <input type="password" style={inputStyle} ref="signupPassword" placeholder="Your password"/>
                                Password again:<input type="password" style={inputStyle} ref="signupPasswordC" placeholder="Your password"/>
                                <button className={buttonTags}>Sign up</button>
                                <div ref="errorTitle"></div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
})

export default Signup;