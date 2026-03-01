module.exports = {
  Platform:    { OS: 'ios', select: (o) => o.ios ?? o.default },
  Dimensions:  { get: () => ({ width: 390, height: 844 }) },
  Animated:    { Value: class { constructor(v){this._v=v} }, timing: ()=>({start:(cb)=>cb&&cb({finished:true})}), loop: ()=>({start:()=>{}}) },
  StyleSheet:  { create: (s) => s, hairlineWidth: 0.5, flatten: (s) => s },
  View:        'View',
  Text:        'Text',
  ScrollView:  'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
  Image:       'Image',
  Alert:       { alert: jest.fn() },
  NativeModules: {},
};
