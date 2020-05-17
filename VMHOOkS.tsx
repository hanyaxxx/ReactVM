import React from 'react';
import { diffType, proxyVM_ExactType, ProxyVMType } from './ExtendProps';
import { Memo, diff } from './ReactVM';

// const VMHooks: VMHooksType = {
//   rootState: null,
//   useVmExact: null,
//   rootStateUpdate: null,
//   Memo: Memo,
//   vm_exact: null,
//   vm: null,
// };
// const initVMHooks = (extendProps) => {
//   VMHooks.vm = ProxyVM.bind(
//     extendProps,
//     // extendProps.rootStateUpdate,
//   );
//   VMHooks.vm_exact = proxyVM_Exact.bind(
//     extendProps,
//     //extendProps.rootStateUpdate,
//   );
//   VMHooks.useVmExact = proxyVM_Exact.bind(
//     extendProps,
//     //extendProps.rootStateUpdate,
//   );
//   VMHooks.useVmExact = useVmExact.bind(VMHooks.rootState);
// };

// var useVmExact: TUseVmExact = (
//   proxyObj = {},
//   filename,
//   props,
//   useState = () => {},
// ) => {
//   React.useMemo(() => {
//     VMHooks.rootState[filename] = VMHooks.vm_exact(
//       VMHooks.rootState[filename],
//       props,
//       useState,
//     );
//   }, []);

//   return VMHooks.rootState;
// };
export class VMHOOkS {
  readonly rootState: any; //根组件状态
  //useVmExact: TVMUseExact;
  readonly rootStateUpdate: () => void; //强制更新根组件
  readonly Memo: React.FC<any>; //Memo组件
  vm_exact: proxyVM_ExactType; //精确响应
  vm: ProxyVMType; //proxy响应
  readonly PROXY_MAP: MapConstructor | any;
  constructor() {
    this.rootState = null;
    this.useVmExact = null;
    this.rootStateUpdate = null;
    this.Memo = Memo;
    this.vm_exact = null;
    this.vm = null;
    this.PROXY_MAP = new Map();
  }
  //初始化 HOOks初始化
  readonly initVMHooks = (extendProps) => {
    this.vm = this.ProxyVM.bind(extendProps);
    this.vm_exact = this.proxyVM_Exact.bind(extendProps);
    this.useVmExact = this.proxyVM_Exact.bind(extendProps);
    this.useVmExact = this.useVmExact.bind(this.rootState);
  };
  //todo 精确代理
  
  proxyVM_Exact: proxyVM_ExactType = (
    //  useRootStateHooks=()=>{},
    proxyObj: any = {}, props: string | any = '', useStateHooks: (value: any, diffcallback: diffType, control: (callback: any) => void) => void = () => { }) => {
    //todo 全局状态管理 一般在每个子组件内部实现注册更新所以value是精确的
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
        // doubleProxy = null;
        // doubleProxy = new Proxy(
        //   {},
        //   {
        //     get(_, prop) {
        //       return proxyObj[prop];
        //     },
        //     set(_, prop, value) {
        //       proxyObj[prop] = value;
        //       return true;
        //     },
        //   },
        // );
        useStateHooks(value, cb, control);
      },
    });
    return proxyObj;
  };
  // 精确代理语法糖
  useVmExact(proxyObj = {}, filename, props, useState = () => { }) {
    React.useMemo(() => {
      this.rootState[filename] = this.vm_exact(this.rootState[filename], props, useState);
    }, []);
    return this.rootState;
  }
  // proxy 代理
  ProxyVM: ProxyVMType = (
    // useRootStateHooks=()=>{},
    proxyObj: any = {}, useStateHooks: (value: any, diffcallback: diffType, control: (callback: any) => void) => void = () => { }) => {
    if (this.PROXY_MAP.has(proxyObj))
      return this.PROXY_MAP.get(proxyObj);
    const p = new Proxy(proxyObj, {
      set(obj, prop, value) {
        const cb: diffType = diff.bind(null, value, obj[prop]);
        obj[prop] = value;
        //const u = useState.bind(null,value);
        const control = (fn): void => {
          fn(value, obj[prop]);
        };
        useStateHooks(value, cb, control);
        //  useStateHooks(useState);
        // callVM(value);
        return true;
      },
    });
    this.PROXY_MAP.set(proxyObj, p);
    return p;
  };
}
