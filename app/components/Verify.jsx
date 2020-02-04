import currentIP from 'ip';
import currentPort from '../port';
import React from 'react';
import axios from 'axios';
//import 'whatwg-fetch';

export var Verify = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();
        var Email = this.refs.Email.value;
        var key = this.refs.Key.value;

        if (Email.length > 0 && key.length > 0) {
                axios({
                    method: 'post',
                    //url:'https://nameless-island-69625.herokuapp.com/login',
                    url: window.location.protocol+'//'+currentIP+':'+currentPort+'/verify',
                    data:{
                        email: Email,
                        key: key
                    }
                }).then(function(response){
                    localStorage.setItem('x-auth',response.headers['x-auth']);
                    window.location.hash='#/';
                }).catch((e)=>{
                        this.refs.errorTitle.appendChild(document.createTextNode("Your number is wrong. Try again or contact us!"));
                        this.refs.Key.focus();
                });
        } else if (Email.length === 0) {
            if(this.refs.errorTitle.firstChild)
                this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
            this.refs.errorTitle.appendChild(document.createTextNode("Please enter your email!"));
            this.refs.Email.focus();
        } else if (Key.length === 0) {
            if(this.refs.errorTitle.firstChild)
                this.refs.errorTitle.removeChild(this.refs.errorTitle.firstChild);
            this.refs.errorTitle.appendChild(document.createTextNode("Please enter they key you recieved in your email!"));
            this.refs.Key.focus();
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
                <h2 className="page-title">MUND - Email Verification</h2>
                <div className="row">
                    <div className="columns small-centered small-10 medium-6 large-4">
                        <div className="container__footer">
                            <form onSubmit={this.handleSubmit}>
                                Email: <input type="text" style={inputStyle} ref="Email" placeholder="Your email"/>
                                Key: <input type="text" style={inputStyle} ref="Key" placeholder="Your key"/>
                                <button className={buttonTags}>Verify</button>
                                <div ref="errorTitle"></div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
})

export default Verify;