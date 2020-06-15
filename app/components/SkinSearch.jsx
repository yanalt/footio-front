var React = require('react');
import '../styles/styles.css';

var SkinSearch = React.createClass({
  handleSearch: function () {
    var showCompleted = true;
    var searchText = this.refs.searchText.value;

    this.props.onSearch(showCompleted, searchText);
  },
  render: function () {
    let inputStyle={}, buttonTags="button expanded";
    if(window.orientation!='undefined'&&window.orientation!=undefined){
        inputStyle={fontSize: '200%', height:'10%', width: '100%',textAlign:'center'};
        buttonTags="button large expanded";
    }
    return (
      <div className="container__header">
        <div>
          <input type="search" style={inputStyle} ref="searchText" placeholder="Search skins" onChange={this.handleSearch}/>
        </div>
      </div>
    )
  }
});

module.exports = SkinSearch;
