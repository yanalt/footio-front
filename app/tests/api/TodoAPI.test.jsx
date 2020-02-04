var expect = require('expect');

var SkinAPI = require('SkinAPI');

describe('SkinAPI', () => {
  beforeEach(() => {
    localStorage.removeItem('skins');
  });

  it('should exist', () => {
    expect(SkinAPI).toExist();
  });

  describe('setSkins', () => {
    it('should set valid skins array', () => {
      var skins = [{
        id: 23,
        test: 'test all files',
        completed: false
      }];
      SkinAPI.setSkins(skins);

      var actualSkins = JSON.parse(localStorage.getItem('skins'));

      expect(actualSkins).toEqual(skins);
    });

    it('should not set invalid skins array', () => {
      var badSkins = {a: 'b'};
      SkinAPI.setSkins(badSkins);

      expect(localStorage.getItem('skins')).toBe(null);
    });
  });

  describe('getSkins', () => {
    it('should return empty array for bad localstorage data', () => {
      var actualSkins = SkinAPI.getSkins();
      expect(actualSkins).toEqual([]);
    });

    it('should return skin if valid array in localstorage', () => {
      var skins = [{
        id: 23,
        test: 'test all files',
        completed: false
      }];

      localStorage.setItem('skins', JSON.stringify(skins));
      var actualSkins = SkinAPI.getSkins();

      expect(actualSkins).toEqual(skins);
    });
  });

  describe('filterSkins', () => {
    var skins = [{
      id: 1,
      text: 'Some text here',
      completed: true
    },{
      id: 2,
      text: 'Other text here',
      completed: false
    },{
      id: 3,
      text: 'Some text here',
      completed: true
    }];

    it('should return all items if showCompleted is true', () => {
      var filteredSkins = SkinAPI.filterSkins(skins, true, '');
      expect(filteredSkins.length).toBe(3);
    });

    it('should return non-completed skins when showCompleted is false', () => {
      var filteredSkins = SkinAPI.filterSkins(skins, false, '');
      expect(filteredSkins.length).toBe(1);
    });

    it('should sort by completed status', () => {
      var filteredSkins = SkinAPI.filterSkins(skins, true, '');
      expect(filteredSkins[0].completed).toBe(false);
    });

    it('should filter skins by searchText', () => {
      var filteredSkins = SkinAPI.filterSkins(skins, true, 'some');
      expect(filteredSkins.length).toBe(2);
    });

    it('should return all skins if searchText is empty', () => {
      var filteredSkins = SkinAPI.filterSkins(skins, true, '');
      expect(filteredSkins.length).toBe(3);
    });
  });
});
