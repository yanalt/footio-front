var React = require('react');
import '../styles/styles.css';

var AddSkin = React.createClass({
  handleSubmit: function (e) {
    e.preventDefault();
    var skinName = this.refs.skinName.value;

    if (skinName.length > 0) {
      this.refs.skinName.value = '';
      this.props.onAddSkin(skinName);
    } else {
      this.refs.skinName.focus();
    }
  },
  render: function () {
    let inputStyle={}, buttonTags="button expanded";
    if(window.orientation!='undefined'&&window.orientation!=undefined){
        inputStyle={fontSize: '500%', height:100};
        buttonTags="button large expanded";
    }
    return (
      <div className="container__footer">
        <form onSubmit={this.handleSubmit}>
          <input type="text" style={inputStyle} ref="skinName" placeholder="What do you need to do?"/>
          <button className={buttonTags}>Add Skin</button>
        </form>
      </div>
    );
  }
});

module.exports = AddSkin;
