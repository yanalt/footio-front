var React = require('react');
var moment = require('moment');

var Skin = React.createClass({
  render: function () {
    let inputStyle={}, buttonTags="button expanded";
    if(window.orientation!='undefined'&&window.orientation!=undefined){
        inputStyle={fontSize: '500%', height:100};
        buttonTags="button large expanded";
    }
    var {_id, name, completed, icon, sprite, price, current} = this.props;
    var idConfirm = _id + "Confirm";
    var idCancel = _id + "Cancel";
    var idBuy = _id + "Buy";
    var srcImage = "/img/" + sprite + ".png";
    var srcFlag ="/img/flags/" + sprite + ".png";
    var here = "";
    if(_id == current){
      here = " - SELECTED";
    }

    if(this.props.Owned!=undefined&&this.props.Owned==true){
        return (
          <div>
            <div>
              <h3>{name} {here}</h3>
            </div>
            <div>

              <img src={srcImage}/>
              <img src={srcFlag}/>
              <button className={buttonTags} id={idBuy} onClick={() => { 
                //this.props.onToggle(_id);
                document.getElementById(idConfirm).style.display="inline";
                document.getElementById(idCancel).style.display="inline";
                document.getElementById(idBuy).style.display="none";
                }}>Choose {name}!</button>
              
              <button className={buttonTags} style={{display: 'none'}} id={idCancel} onClick={() => { 
                document.getElementById(idConfirm).style.display="none";
                document.getElementById(idCancel).style.display="none";
                document.getElementById(idBuy).style.display="inline";
                }}>Cancel</button>
                <button className={buttonTags} style={{display: 'none'}} id={idConfirm} onClick={() => { this.props.onConfirm(_id); }}>Confirm</button>
            </div>
          </div>
      )
    }
    return (
      <div>
      <div>
        <p>{name} - {price}</p>
      </div>
      <div>
        <img src={srcImage}/>
        <img src={srcFlag}/>
        
      </div>
        <div>
          <button className={buttonTags} id={idBuy} onClick={() => { 
            //this.props.onToggle(_id);
            document.getElementById(idConfirm).style.display="inline";
            document.getElementById(idCancel).style.display="inline";
            document.getElementById(idBuy).style.display="none";
            }}>Buy {name}!</button>
          
          <button className={buttonTags} style={{display: 'none'}} id={idCancel} onClick={() => { 
            document.getElementById(idConfirm).style.display="none";
            document.getElementById(idCancel).style.display="none";
            document.getElementById(idBuy).style.display="inline";
            }}>Cancel</button>
            <button className={buttonTags} style={{display: 'none'}} id={idConfirm} onClick={() => { this.props.onConfirm(_id,price); }}>Confirm</button>
        </div>
      </div>
    )
  }
});

module.exports = Skin;