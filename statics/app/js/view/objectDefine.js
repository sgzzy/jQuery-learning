/**
 * Created by Administrator on 2017/1/10.
 */
var o = {};
Object.defineProperty(o, "code", {
  enumerable: false,
  configurable: false,
  writable: false,
  value: "private"
});
console.log(o.code);

var oDesc = {};

/**
 *
 * @param {Number(2)} nMask
 * @param {Object} oObj
 * @param {String} sKey
 * @param {any} vVal_fGet
 * @param {any} fSet
 */
function setProp(nMask, oObj, sKey, vVal_fGet, fSet){
  if (nMask & 8) { // nMask & 1000
    // 访问描述符
    if (vVal_fGet) {
      oDesc.get = vVal_fGet;
    } else {
      delete  oDesc.get;
    }
    if (fSet) {
      oDesc.set = fSet;
    } else {
      delete oDesc.set;
    }
    delete  oDesc.value;
    delete  oDesc.writable;
  } else {
    // 属性描述符
    if (arguments.length > 3) {
      oDesc.value = vVal_fGet;
    } else {
      delete oDesc.value;
    }
    oDesc.writable = Boolean(nMask & 4); // nMask & 100
    delete oDesc.get;
    delete oDesc.set;
  }
  oDesc.enumerable = Boolean(nMask & 1);
  oDesc.configurable = Boolean(nMask & 2);
  Object.defineProperty(oObj, sKey, oDesc);
  return oObj;
}
/*
 * :: function setProp ::
 *
 * nMask 是一个位掩码:
 *  flag 0x1: property is enumerable,
 *  flag 0x2: property is configurable,
 *  flag 0x4: property is writable,
 *  flag 0x8: property is accessor descriptor.
 * oObj 是一个要定义属性的对象
 * sKey 是需要定义或改进的属性的属性名;
 * vVal_fGet 是分配给数据描述符或getter函数的值
 * 指定给访问描述符（取决于位掩码）
 * fSet 为一个指定给访问描述符的setter函数的值;
 *
 * Bitmask possible values:
 *
 *  0  : readonly data descriptor - not configurable, not enumerable (0000).
 *  1  : readonly data descriptor - not configurable, enumerable (0001).
 *  2  : readonly data descriptor - configurable, not enumerable (0010).
 *  3  : readonly data descriptor - configurable, enumerable (0011).
 *  4  : writable data descriptor - not configurable, not enumerable (0100).
 *  5  : writable data descriptor - not configurable, enumerable (0101).
 *  6  : writable data descriptor - configurable, not enumerable (0110).
 *  7  : writable data descriptor - configurable, enumerable (0111).
 *  8  : accessor descriptor - not configurable, not enumerable (1000).
 *  9  : accessor descriptor - not configurable, enumerable (1001).
 *  10 : accessor descriptor - configurable, not enumerable (1010).
 *  11 : accessor descriptor - configurable, enumerable (1011).
 *
 *  Note: If the flag 0x8 is setted to "accessor descriptor" the flag 0x4 (writable)
 *  will be ignored. If not, the fSet argument will be ignored.
 */

// example
var myObj = {};

// adding a writable data descriptor - not configurable, not enumerable
setProp(4, myObj, 'myNumber', 25); // 0100 myObj.myNumber = 25

// adding a readonly data descriptor - not configurable, enumerable
setProp(1, myObj, 'myString', 'Hello world!'); //0001  myObj.muString = "Hello world!"

// adding an accessor descriptor - not configurable, enumerable
setProp(9, myObj, 'myArray', function() { // 1001
  for (var iBit = 0, iFlag = 1, aBoolArr = [false];
       iFlag < this.myNumber + 1 || (this.myNumber & iFlag); // 25: 11001 & 00001
       iFlag = iFlag << 1 // 100000  iBit == 5
  ) {
    aBoolArr[iBit++] = Boolean(this.myNumber & iFlag); // 00001 00000 00000 01000 10000
  }
  return aBoolArr;
}, function(aNewMask) {
  for (var nNew = 0, iBit = 0; iBit < aNewMask.length; iBit++) {
    nNew |= Boolean(aNewMask[iBit]) << iBit;
  }
  this.myNumber = nNew;
});
// adding a writable data descriptor (undefined value) - configurable, enumerable
setProp(7, myObj, 'myUndefined'); // 0111

// adding an accessor descriptor (only getter) - configurable, enumerable
setProp(11, myObj, 'myDate', function() { return new Date(); }); // 1011

// adding an accessor descriptor (only setter) - not configurable, not enumerable
setProp(8, myObj, 'myAlert', null, function(sTxt) { console.log(sTxt); }); // 1000

myObj.myAlert = myObj.myDate.toLocaleString() + '\n\n' + myObj.myString +
  '\nThe number ' + myObj.myNumber + ' represents the following bitmask: ' +
  myObj.myArray.join(', ') + '.';
/**
 * Data
 *
 *
 * Hello world!
 * The number 25 represents the following bitmask: true, false, false, true, true.
 *
 */

// listing the enumerable properties
var sList = 'Here are the enumerable properties of myObj object:\n';
for (var sProp in myObj) {
  sList += '\nmyObj.' + sProp + ' => ' + myObj[sProp] + ';'
}
console.log(sList);

/**
 * Here are the enumerable properties of myObj object:
 * myObj.myNumber => 25;
 *
 */

// 将上述方法添加到Object中
// creating a new Object method named Object.setProperty()

new (function() {
  var oDesc = this;
  Object.setProperty = function(nMask, oObj, sKey, vVal_fGet, fSet) {
    if (nMask & 8) {
      // accessor descriptor
      if (vVal_fGet) {
        oDesc.get = vVal_fGet;
      } else {
        delete oDesc.get;
      }
      if (fSet) {
        oDesc.set = fSet;
      } else {
        delete oDesc.set;
      }
      delete oDesc.value;
      delete oDesc.writable;
    } else {
      // data descriptor
      if (arguments.length > 3) {
        oDesc.value = vVal_fGet;
      } else {
        delete oDesc.value;
      }
      oDesc.writable = Boolean(nMask & 4);
      delete oDesc.get;
      delete oDesc.set;
    }
    oDesc.enumerable = Boolean(nMask & 1);
    oDesc.configurable = Boolean(nMask & 2);
    Object.defineProperty(oObj, sKey, oDesc);
    return oObj;
  };
})();
