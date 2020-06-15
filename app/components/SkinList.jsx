var React = require('react');
var Skin = require('Skin');
import '../styles/styles.css';

var SkinList = React.createClass({
  render: function () {
    var {skins,current} = this.props;
    var renderSkins = () => {
      if (skins.length === 0) {
        return (
          <p className="container__message">Nothing To Show</p>
        );
      }

      return skins.map((skin) => {
        return (
          <Skin current={current} key={skin._id} {...skin} onConfirm={this.props.onConfirm}/>
        );
      });
    };

    return (
      <div>
        {renderSkins()}
      </div>
    )
  }
});

module.exports = SkinList;
