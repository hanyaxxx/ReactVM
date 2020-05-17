import React from 'react';

import { Layout, Row, Divider } from 'antd';

import {
  diffType,
  VMHooksType,
  VMECallbackType,
  ExtendProps,
  TUseVmExact,
  TVMUseExact,
  TSUseVmExact,
  IUseVM,
} from './ExtendProps'; //接口文件

import { VMHOOkS } from './VMHOOkS';
import { proxyVM_Exact, ProxyVM } from './PROXY_MAP';
const { Header, Footer, Sider, Content } = Layout;

//Memo组件
var Memo = ({ children, value }) => {
  if (!Array.isArray(value)) {
    throw new Error('Memo组件的value属性需要一个数组[v1,v2]');
  }

  const memoChildren = React.useMemo(
    () => {
      // console.log('value更新',value)
      return children;
    },
    //useValue children;
    value,
  );

  return <>{memoChildren}</>;
};

export const diff: diffType = (
  next,
  pre,
  callback = (p) => {},
  failcallback = (p) => {},
) => {
  const db = pre === next;

  if (db) {
    failcallback({
      value: next,
      prev: pre,
      is: db,
    });
  } else {
    callback(next);
  }
};

function ReactVM(mark: 'use') {
  const VMHooks: VMHooksType = new VMHOOkS();
  //todo 为组件保持私有状态时每次更新的是一个{}

  //精确代理响应语法糖
  var useVmExactS: TSUseVmExact = (
    proxyObj = {},
    //filename,
    props: string | Array<string> | any,
    useState = () => {},
  ) => {
    React.useMemo(() => {
      /// debugger
      if (typeof props === 'object') {
        Object.keys(props).forEach((p: string) => {
          proxyVM_Exact(proxyObj, props[p], useState);
        });

        //proxyVM_Exact(proxyObj, (props as string), useState);
      } else {
        proxyVM_Exact(proxyObj, props, useState);
      }
    }, []);

    return proxyObj;
  };

  var useVM: IUseVM = (state, useState, callback) => {
    React.useMemo(() => {
      useState(ProxyVM(state, callback));
    }, []);
  };
  const MemoMap = new Map();
  const DeepInjectState = (children, extendProps): JSX.Element => {
    return React.Children.map(children, function (child) {
      if (child.props.children) {
        return DeepInjectState(child.props.children, extendProps);
      }
      // console.log(child.props)
      let cc;
      let b;
      const save = MemoMap.get(child);
      if (save) {
        //console.log(save);
        b=save
      } else {
        b = child.props.hasOwnProperty('$memo');
        MemoMap.set(child, b);
      }

    //  const has = MemoMap.has(child);

      // console.log(b);
      if (b) {
        cc = React.useMemo(() => {
          return React.cloneElement(child, extendProps);
        }, child.props.$memo);
      } else {
        cc = React.cloneElement(child, extendProps);
      }
      return cc;
    });
  };

  const shallowInjectState = (children, extendProps): JSX.Element => {
    return React.Children.map(children, function (child) {
      const cc = React.cloneElement(child, extendProps);
      return cc;
    });
  };

  const extendParentState = (extendProps: ExtendProps) => {
    //属性继承
    extendProps.extendParentState = extendParentState;
    extendProps.Memo = Memo;
    VMHooks.initVMHooks(extendProps);
    extendProps.vm = ProxyVM;
    extendProps.vm_exact = proxyVM_Exact;
    extendProps.useVME = useVmExactS;
    extendProps.useVM = useVM;
    return (props, extraState, shallow = false) => {
      const p = { ...props };
      p.children = null;
      extendProps = {
        ...extendProps,
        ...extraState,
        ...p,
      };
      let childrenWithProps;
      if (shallow) {
        childrenWithProps = shallowInjectState(props.children, extendProps);
      } else {
        childrenWithProps = DeepInjectState(props.children, extendProps);
      }
      // const childrenWithProps = DeepInjectState(props.children, extendProps);

      return childrenWithProps || <></>;
    };
  };

  //原始组件root

  //注入继承式的子组件
  const InjectComponent = (Component: React.FC<any>) => {
    return (props) => {
      ///return <Component></Component>;
      const children = props.extendRootState(props);
      return <Component {...props}>{children}</Component>;
    };
  };
  const shallowInjectComponent = (Component: React.FC<any>) => {
    return (props) => {
      ///return <Component></Component>;
      const children = props.extendRootState(props, {}, true);
      return <Component {...props}>{children}</Component>;
    };
  };

  const InitRootCompoent = (Root: React.FC<any>) => {
    return ({ children }: { children: Array<JSX.Element> }): JSX.Element => {
      const [rootState, useRootState] = React.useState<any>({});
      VMHooks.rootState = rootState;
      VMHooks.rootStateUpdate = rootStateUpdate;
      var rootStateUpdate = () => {
        useRootState({ ...rootState });
      };

      const extendRootState = extendParentState({
        rootState,
        rootStateUpdate,
      });
      const childrenWithProps = extendRootState(
        { children },
        { extendRootState },
      );
      return <Root>{childrenWithProps}</Root>;
    };
  };

  const Void = (props) => {
    return <>{props.children}</>;
  };

  const Component = InitRootCompoent(Void);
  const ComponentHandler: React.FC<any> = InjectComponent(Void);
  const ComponentShallowHandler: React.FC<any> = shallowInjectComponent(Void);
  return {
    Component,
    ComponentHandler,
    ComponentShallowHandler,
    Void,
    Memo,
    InjectComponent,
    InitRootCompoent,
    shallowInjectComponent,
    VMHooks,
    // ComponentHead,
    //ComponentContent,
    // ComponentSider,
    //ComponentLayout,
  };

  //const ComponentHead: React.FC = InjectComponent(Header);
  //const ComponentContent: React.FC = InjectComponent(Content);
  // const ComponentSider: React.FC = InjectComponent(Sider);
  //const ComponentLayout: React.FC = InjectComponent(Layout);
}

// const Component = ({ children }) => {
//   const [rootState, useRootState] = React.useState<any>({});
//   const rootStateUpdate = () => {
//     useRootState({ ...rootState });
//   };

//   const extendRootState = extendParentState({ rootState, rootStateUpdate });
//   const childrenWithProps = extendRootState({ children }, { extendRootState });
//   return <Layout>{childrenWithProps}</Layout>;
// };

// const ComponentLayout: any = (props: any) => {
//   const children = props.extendRootState(props);
//   return <Layout {...props}>{children}</Layout>;
// };

export { ReactVM, ExtendProps, Memo };
