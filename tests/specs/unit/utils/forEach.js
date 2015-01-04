define([], function () {

  describe('utils / forEach', function () {

    var s = '';
    var fn = function (item) {
      s += '[' + item + ']';
    };

    it('should execute a provided function once per array element', function () {
      s = '';
      hello.utils.forEach(['one', 'two', 'three'], fn);
      expect(s).to.be.eql('[one][two][three]');
    });

    it('should ignore empty arrays and invalid arguments', function () {
      s = 'unaltered';
      hello.utils.forEach([], fn);
      hello.utils.forEach({}, fn);
      hello.utils.forEach(null, fn);
      expect(s).to.be.eql('unaltered');
    });

  });

});
