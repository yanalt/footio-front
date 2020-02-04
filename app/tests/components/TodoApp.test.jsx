var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var expect = require('expect');
var $ = require('jquery');

var SkinApp = require('SkinApp');

describe('SkinApp', () => {
  it('should exist', () => {
    expect(SkinApp).toExist();
  });

  it('should add skin to the skins state on handleAddSkin', () => {
    var skinText = 'test text';
    var skinApp = TestUtils.renderIntoDocument(<SkinApp/>);

    skinApp.setState({skins: []});
    skinApp.handleAddSkin(skinText);

    expect(skinApp.state.skins[0].text).toBe(skinText);
    expect(skinApp.state.skins[0].createdAt).toBeA('number');
  });

  it('should toggle completed value when handleToggle called', () => {
    var skinData = {
      id: 11,
      text: 'Test features',
      completed: false,
      createdAt: 0,
      completedAt: undefined
    };
    var skinApp = TestUtils.renderIntoDocument(<SkinApp/>);
    skinApp.setState({skins: [skinData]});

    expect(skinApp.state.skins[0].completed).toBe(false);
    skinApp.handleToggle(11);
    expect(skinApp.state.skins[0].completed).toBe(true);
    expect(skinApp.state.skins[0].completedAt).toBeA('number');
  });

  // Test that when toggle from true to false, completedAt get removed
  it('should toggle skin from completed to incompoleted', () => {
    var skinData = {
      id: 11,
      text: 'Test features',
      completed: true,
      createdAt: 0,
      completedAt: 123
    };
    var skinApp = TestUtils.renderIntoDocument(<SkinApp/>);
    skinApp.setState({skins: [skinData]});

    expect(skinApp.state.skins[0].completed).toBe(true);
    skinApp.handleToggle(11);
    expect(skinApp.state.skins[0].completed).toBe(false);
    expect(skinApp.state.skins[0].completedAt).toNotExist();
  });
});
