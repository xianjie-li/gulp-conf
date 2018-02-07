'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var one = 1,
    two = 2,
    three = 3;

var Humen = function () {
  //构造函数
  function Humen(name, age) {
    _classCallCheck(this, Humen);

    this.name = name;
    this.age = age;
  }

  _createClass(Humen, [{
    key: 'output',
    value: function output() {
      alert('\u6211\u53EB' + this.name + ',\u5E74\u662F' + this.age);
    }
    //静态方法

  }, {
    key: 'longName',

    //get & set
    get: function get() {
      return 'long' + this.name;
    },
    set: function set(val) {
      this.name = val;
    }
  }], [{
    key: 'foo',
    value: function foo() {
      alert('这是一个静态方法');
    }
  }]);

  return Humen;
}();
//# sourceMappingURL=es6.js.map
