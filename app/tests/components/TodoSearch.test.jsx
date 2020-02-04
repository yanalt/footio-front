var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var expect = require('expect');
var $ = require('jquery');

var SkinSearch = require('SkinSearch');

describe('SkinSearch', () => {
  it('should exist', () => {
    expect(SkinSearch).toExist();
  });

  it('should call onSearch with entered input text', () => {
    var searchText = 'Dog';
    var spy = expect.createSpy();
    var skinSearch = TestUtils.renderIntoDocument(<SkinSearch onSearch={spy}/>);

    skinSearch.refs.searchText.value = searchText;
    TestUtils.Simulate.change(skinSearch.refs.searchText);

    expect(spy).toHaveBeenCalledWith(false, 'Dog');
  });

  it('should call onSearch with proper checked value', () => {
    var spy = expect.createSpy();
    var skinSearch = TestUtils.renderIntoDocument(<SkinSearch onSearch={spy}/>);

    skinSearch.refs.showCompleted.checked = true;
    TestUtils.Simulate.change(skinSearch.refs.showCompleted);

    expect(spy).toHaveBeenCalledWith(true, '');
  });
});
