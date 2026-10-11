// Added by the SMBCR site to every archived game version (tools/archive/build-versions.mjs), as the
// first script on the page. The archive is served from the same origin as the live game, so without
// this an old version would read and overwrite players' real save files. It gives this version its
// own namespace in localStorage, sessionStorage and IndexedDB; the game itself is unchanged.
(function () {
  var P = '__PREFIX__';
  var S = Storage.prototype;
  var get = S.getItem, set = S.setItem, del = S.removeItem, key = S.key;
  var len = Object.getOwnPropertyDescriptor(S, 'length').get;
  function own(store) {
    var out = [];
    for (var i = 0, n = len.call(store); i < n; i++) {
      var k = key.call(store, i);
      if (k !== null && k.indexOf(P) === 0) out.push(k);
    }
    return out;
  }
  S.getItem = function (k) { return get.call(this, P + k); };
  S.setItem = function (k, v) { return set.call(this, P + k, v); };
  S.removeItem = function (k) { return del.call(this, P + k); };
  S.key = function (i) { var k = own(this)[i]; return k === undefined ? null : k.slice(P.length); };
  S.clear = function () { var ks = own(this); for (var i = 0; i < ks.length; i++) del.call(this, ks[i]); };
  Object.defineProperty(S, 'length', { configurable: true, get: function () { return own(this).length; } });
  if (window.indexedDB) {
    var F = Object.getPrototypeOf(window.indexedDB);
    var open = F.open, drop = F.deleteDatabase;
    F.open = function (name) { var a = [].slice.call(arguments); a[0] = P + name; return open.apply(this, a); };
    F.deleteDatabase = function (name) { return drop.call(this, P + name); };
  }
})();
