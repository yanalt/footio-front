var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var expect = require('expect');
var $ = require('jquery');

var Skin = require('Skin');

describe('Skin', () => {
  it('should exist', () => {
    expect(Skin).toExist();
  });

  it('should call onToggle prop with id on click', () => {
    var skinData = {
      id: 199,
      text: 'Write skin.test.jsx test',
      completed: true
    };
    var spy = expect.createSpy();
    var skin = TestUtils.renderIntoDocument(<Skin {...skinData} onToggle={spy}/>);
    var $el = $(ReactDOM.findDOMNode(skin));

    TestUtils.Simulate.click($el[0]);

    expect(spy).toHaveBeenCalledWith(199);
  });
});
