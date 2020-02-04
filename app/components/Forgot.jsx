import currentIP from 'ip';
import currentPort from '../port';
import React from 'react';
import axios from 'axios';
//import 'whatwg-fetch';

export var Forgot = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();
        var Email = this.refs.Email.value;
        var Password = this.refs.Password.value;
        var PasswordC = this.refs.PasswordC.value;
        var key = this.refs.Key.value;

        if (Email.length > 0 && Password.length > 0 && PasswordC.length > 0 && key.length > 0) {
            if(Password===PasswordC){
                axios({
                    method: 'patch',
                    //url:'https://nameless-island-69625.herokuapp.com/login',
                    url: window.location.protocol+'//'+currentIP+':'+currentPort+'/users',
                    data:{
                        email: Email,
                        password: Password,
                        key: key
                    }
                }).then(function(response){
                    localStorage.setItem('x-auth',response.headers['x-auth']);
                    window.location.hash='#/skins';
                }).catch((e)=>{
                    if(e.data.code==11000){
                        if(this.refs.errorTitle.firstChild)
                            this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                        this.refs.errorTitle.appendChild(document.createTextNode("Email already in use!"));
                        this.refs.Email.focus();
                    } else if(e.data.name=="ValidationError"){
                        if(this.refs.errorTitle.firstChild)
                            this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                        this.refs.errorTitle.appendChild(document.createTextNode("Password must be longer than 6 characters!"));
                        this.refs.Password.focus();
                    }
                });
            }else{
                if(this.refs.errorTitle.firstChild)
                    this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                this.refs.errorTitle.appendChild(document.createTextNode("Passwords must match!"));
                this.refs.PasswordC.focus();
            }
        } else {
            if (Password.length === 0) {
                if(this.refs.errorTitle.firstChild)
                    this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                this.refs.errorTitle.appendChild(document.createTextNode("Please enter a password!"));
                this.refs.Password.focus();
            }
            if (Email.length === 0) {
                if(this.refs.errorTitle.firstChild)
                    this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                this.refs.errorTitle.appendChild(document.createTextNode("Please enter your email!"));
                this.refs.Email.focus();
            }
            if (Key.length === 0) {
                if(this.refs.errorTitle.firstChild)
                    this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
                this.refs.errorTitle.appendChild(document.createTextNode("Please enter they key your recieved in your email!"));
                this.refs.Key.focus();
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
                <h2 className="page-title">MUND - Password reset</h2>
                <div className="row">
                    <div className="columns small-centered small-10 medium-6 large-4">
                        <div className="container__footer">
                            <form onSubmit={this.handleSubmit}>
                                Email: <input type="text" style={inputStyle} ref="Email" placeholder="Your email"/>
                                Key: <input type="text" style={inputStyle} ref="Key" placeholder="Your key"/>
                                New password: <input type="password" style={inputStyle} ref="Password" placeholder="Your password"/>
                                New password again:<input type="password" style={inputStyle} ref="PasswordC" placeholder="Your password"/>
                                <button className={buttonTags}>Reset</button>
                                <div ref="errorTitle"></div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
})

export default Forgot;