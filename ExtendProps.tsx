import React, { ReactFragment } from 'react';
 export type IUseVM = (stateHook,useStateHook,callback:(newState,diff,contorl)=>void)=>void


 type IObject={
   [props:string]:any
 }

type IExtendParentProps=(props, extraState) => React.FC<any> | JSX.Element

export interface ExtendProps {
  extendParentState?: (props: ExtendProps) => IExtendParentProps; //继承父亲的状态
  extendRootState?: IExtendParentProps; //继承根节点状态
  Memo?: React.FC<any>; //缓存组件
  rootState?: any; //根节点状态
  rootStateUpdate?: (params) => any; //更新根节点
  vm?: (stateHook: IObject, callback: (newState, diff, control) => void) => any; //为数据添加响应式 proxy
  vm_exact?: (
    stateHook: IObject,
    propsname: string,
    callback: (newState, diff, control) => void,
  ) => any; //精确响应defineProperty
  useVME?: TSUseVmExact; // 语法糖 = react.useMemo( ()=>vm_exact,[])
  useVM?: IUseVM;
  // [propname: string]: any;
}


type callbackType = (params: {
  value?: any;
  prev?: any;
  is?: boolean;
}) => void;


export type diffType = (prev: any, newvalue: any, callback: callbackType, failcallback: (p: any) => void) => void;
type voidType = (value?: any, diff?: diffType) => void;
// type aa = (value?:any,diff?:diffType) => void
type useStateHooksType = (value?: any, diff?: diffType, control?: (any: any) => void) => void;
export type ProxyVMType = (
  // useRootStateHooks: any,
   proxyObj: any, 
   useStateHooks: (value?: any, diff?: diffType, control?: (any: any) => void) => void
   ) => any;
export type proxyVM_ExactType = (
  useRootStateHooks: any,
  props: string,
  proxyObj: any,
  callbackUseHooks?: (
    value?: any,
    diff?: diffType,
    control?: (any: any) => void,
  ) => void,
) => any;
export type VMECallbackType = (newVal?: any, diff?: (useStateHooks: () => void, failcallback?: (p: {
  value: any;
  prev: any;
  is: boolean;
}) => void) => void, Control?: (nextValue?: any, prevValue?: any) => void) => void;
export type TUseVmExact = (
    proxyObj: any,
    filename: string,
    propsname: string,
    useState: (
      newVal?: any,
      diff?: (
        useStateHooks: () => void,
        failcallback?: (p: { value: any; prev: any; is: boolean }) => void,
      ) => void,
      Control?: (nextValue?: any, prevValue?: any) => void,
    ) => void,
  ) => any;

export type TSUseVmExact = (
  proxyObj: any,
  propsname: string | Array<string>|any,
  callback: (
    newState?: any,
    diff?: (
      useStateHooks: () => void,
      failcallback?: (p: { value: any; prev: any; is: boolean }) => void,
    ) => void,
    Control?: (nextValue?: any, prevValue?: any) => void,
  ) => void,
) => any;

export type TVMUseExact = (
  filename?: string,
  props?: string,
  useState?: (
    newVal?: any,
    diff?: (
      useStateHooks: () => void,
      failcallback?: (p: { value: any; prev: any; is: boolean }) => void,
    ) => void,
    Control?: (nextValue?: any, prevValue?: any) => void,
  ) => void,
) => any;

export type VMHooksType = {
  rootState: any; //获取根组件状态
  useVmExact: TVMUseExact; // Vm_exact+React.useMemo([])语法糖
  rootStateUpdate: () => any; //强制更新Compont组件
  Memo: React.FC<any>; // react.memo语法糖
  vm_exact: proxyVM_ExactType; //defineproty
  vm: ProxyVMType; //proxy
  initVMHooks: (p: any) => any;
};
