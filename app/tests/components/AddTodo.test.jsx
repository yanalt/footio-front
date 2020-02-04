var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var expect = require('expect');
var $ = require('jquery');

var AddSkin = require('AddSkin');

describe('AddSkin', () => {
  it('should exist', () => {
    expect(AddSkin).toExist();
  });

  it('should call onAddSkin prop with valid data', () => {
    var skinText = 'Check mail';
    var spy = expect.createSpy();
    var addSkin = TestUtils.renderIntoDocument(<AddSkin onAddSkin={spy}/>);
    var $el = $(ReactDOM.findDOMNode(addSkin));

    addSkin.refs.skinText.value = skinText;
    TestUtils.Simulate.submit($el.find('form')[0]);

    expect(spy).toHaveBeenCalledWith(skinText);
  });

  it('should not call onAddSkin prop when invalid input', () => {
    var skinText = '';
    var spy = expect.createSpy();
    var addSkin = TestUtils.renderIntoDocument(<AddSkin onAddSkin={spy}/>);
    var $el = $(ReactDOM.findDOMNode(addSkin));

    addSkin.refs.skinText.value = skinText;
    TestUtils.Simulate.submit($el.find('form')[0]);

    expect(spy).toNotHaveBeenCalled();
  });
});
