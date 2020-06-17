import '../styles/styles.css';
var React = require('react');

var Skin = React.createClass({
  render: function () {
    let inputStyle={}, 
    buttonTags={
      fontSize: 27
    },
    hiddenButtonTags={
      fontSize: 27,
      display: 'none'
    };
    let skinContainer ={
      border: '2px solid blue',
      borderRadius: '20px',
      padding: 10,
      fontSize: 27
    }
    // if(window.orientation!='undefined'&&window.orientation!=undefined){
    //     inputStyle={fontSize: '500%', height:100};
    //     buttonTags="button large expanded";
    // }
    var {_id, name, completed, icon, sprite, price, current} = this.props;
    var idConfirm = _id + "Confirm";
    var idCancel = _id + "Cancel";
    var idUnlock = _id + "Unlock";
    var srcImage = "/img/" + sprite + ".png";
    var srcFlag ="/img/flags/" + sprite + ".png";
    var here = "";
    if(_id == current){
      here = " - SELECTED";
    }

    if(this.props.Owned!=undefined&&this.props.Owned==true){
        return (
          <div style={skinContainer}>
            <div>
              <h3>{name} {here}</h3>
            </div>
            <div>

              <img src={srcImage}/>
              <img src={srcFlag}/>
              <button style={buttonTags} id={idUnlock} onClick={() => { 
                //this.props.onToggle(_id);
                document.getElementById(idConfirm).style.display="inline";
                document.getElementById(idCancel).style.display="inline";
                document.getElementById(idUnlock).style.display="none";
                }}>Choose {name}!</button>
              
              <button style={hiddenButtonTags} id={idCancel} onClick={() => { 
                document.getElementById(idConfirm).style.display="none";
                document.getElementById(idCancel).style.display="none";
                document.getElementById(idUnlock).style.display="inline";
                }}>Cancel</button>
                <button style={hiddenButtonTags} id={idConfirm} onClick={() => { this.props.onConfirm(_id); }}>Confirm</button>
            </div>
          </div>
      )
    }
    return (
      <div style={skinContainer}>
      <div>
        <img src={srcImage}/>
        <img src={srcFlag}/>
        
      </div>
        <div>
          {name} - {price} coins <br/>
          <button style={buttonTags} id={idUnlock} onClick={() => { 
            //this.props.onToggle(_id);
            document.getElementById(idConfirm).style.display="inline";
            document.getElementById(idCancel).style.display="inline";
            document.getElementById(idUnlock).style.display="none";
          }}>Unlock</button>
          <button style={hiddenButtonTags} id={idCancel} onClick={() => { 
            document.getElementById(idConfirm).style.display="none";
            document.getElementById(idCancel).style.display="none";
            document.getElementById(idUnlock).style.display="inline";
            }}>Cancel</button>
            <button style={hiddenButtonTags} id={idConfirm} onClick={() => { this.props.onConfirm(_id,price); }}>Confirm</button>
        </div>
      </div>
    )
  }
});

module.exports = Skin;
