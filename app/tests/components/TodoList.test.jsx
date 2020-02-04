var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var expect = require('expect');
var $ = require('jquery');

var SkinList = require('SkinList');
var Skin = require('Skin');

describe('SkinList', () => {
  it('should exist', () => {
    expect(SkinList).toExist();
  });

  it('should render one Skin component for each skin item', () => {
    var skins = [{
      id: 1,
      text: 'Do something'
    }, {
      id: 2,
      text: 'Check mail'
    }];
    var skinList = TestUtils.renderIntoDocument(<SkinList skins={skins}/>);
    var skinsComponents = TestUtils.scryRenderedComponentsWithType(skinList, Skin);

    expect(skinsComponents.length).toBe(skins.length);
  });

  it('should render empty message if no skins', () => {
    var skins = [];
    var skinList = TestUtils.renderIntoDocument(<SkinList skins={skins}/>);
    var $el = $(ReactDOM.findDOMNode(skinList));

    expect($el.find('.container__message').length).toBe(1);
  });
});
