import { diffType, proxyVM_ExactType, ProxyVMType } from './ExtendProps';
import { diff } from './ReactVM';
const DoubleProxy = (proxyObj) => {
  const doubleProxy = new Proxy(
    {},
    {
      get(_, prop) {
        return proxyObj[prop];
      },
      set(_, prop, value) {
        proxyObj[prop] = value;
        return true;
      },
    },
  );
  return doubleProxy;
};
const PROXY_MAP = new Map();
export const ProxyVM: ProxyVMType = (
  // useRootStateHooks=()=>{},
  proxyObj: any = {}, useStateHooks: (value: any, diffcallback: diffType, control: (callback: any) => void) => void = () => { }) => {
  if (PROXY_MAP.has(proxyObj))
    return PROXY_MAP.get(proxyObj);
  const p = new Proxy(proxyObj, {
    set(obj, prop, value) {
      const cb: diffType = diff.bind(null, value, obj[prop]);
      obj[prop] = value;
      //const u = useState.bind(null,value);
      const control = (fn): void => {
        fn(value, obj[prop]);
      };
      let dp = DoubleProxy(p);
      useStateHooks(dp, cb, control);
      //  useStateHooks(useState);
      // callVM(value);
      return true;
    },
  });
  PROXY_MAP.set(proxyObj, p);
  return p;
};
// 精确代理响应
export const proxyVM_Exact: proxyVM_ExactType = (
  //  useRootStateHooks=()=>{},
  proxyObj: any = {}, props: string | any = '', useStateHooks: (value: any, diffcallback: diffType, control: (callback: any) => void) => void = () => { }) => {
  let pv = proxyObj[props];
  //  const obj={}
  //  obj[props] = proxyObj[props];
  let doubleProxy;
  Object.defineProperty(proxyObj, props, {
    // writable: true,
    configurable: true,
    enumerable: true,
    get() {
      return pv;
      // return obj[props];
    },
    set(value) {
      const cb: diffType = diff.bind(null, value, proxyObj[props]);
      pv = value;
      // obj[props] = value;
      const control = (fn): void => {
        fn(value, proxyObj[props]);
      };
      doubleProxy = null;
      doubleProxy = DoubleProxy(proxyObj);
      useStateHooks(doubleProxy, cb, control);
    },
  });
  return proxyObj;
};
