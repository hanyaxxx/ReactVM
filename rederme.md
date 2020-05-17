使用


ComponentHandler + Component 属性自动下发继承
```js
import { ReactVM }  from 'xxx'

1.  const { 
    ComponentHandler, // 可深度传递props属性的组件, 
    Component, // 主题包装容器,全局状态在这里保存与创建,自动下发所有内置属性到子组件
    InjectComponent, //注入一个新的compoent子组件
    InitRootCompoent,//生成一个自己的Component组件
    VMHooks, //实现响应式的接口
    Void,//空组件,实现包装功能
   } ReactVM('use')


const children=(props)=>{
 //api 来自Component 组件
  const {
  extendParentState?: any; //继承父亲的状态
  Memo?: any; //React.useMemo 的语法糖 可以缓存组件
  extendRootState?: any; //继承根节点状态
  rootState?: any; //根节点状态
  rootStateUpdate?: any; //更新根节点
  vm?; //为数据添加响应式 proxy
  vm_exact?//精确响应defineProperty
  ... //Component节点下其他所有属性
  } = props  


return (
  //属性继续转发
  <ComponentHandler {...props}> 
         ....
    </ComponentHandler>
)

}

const ComponentCameTrue = () => {
  return (
    <div>
      <Component>
        <ComponentHandler >
          <Children />
        </ComponentHandler>

      </Component>
    </div>
  );
};


```

使用useVM 或者 useVME 实现状态响应式更新
使用 $memo 属性 实现缓存组件 
```js
enum propsnames {
  orglist = 'queryinput_orgList',
  type = 'queryinput_type',
  account = 'queryinput_account',
}

export const Children: React.FC<ExtendProps> = (props) => {
  const [Value, useValue] = React.useState<any>({});
  const { vm_exact, useVME, vm, useVM } = props;

  useVM(Value, useValue, (newState) => {
    useValue(newState);
  });

  // useVME(Value, propsnames, (newState) => {
  //   useValue(newState);
  // });

  return (
    <ComponentHandler
      childrenState={Value}
      cr={{ orglist: 'orglist' }}
      {...props}
    >
      <Col>
        <QueryButton title="新增"></QueryButton>
      </Col>
      <Col>
        <QueryRules>
          <QueryInput
            size="large"
            $memo={[Value[propsnames.type]]}
            name={propsnames.orglist}
            title={'核算组织'}
          />
          <QueryInput size="large" name={propsnames.type} title={'单据类型'} />
          <QueryInput
            size="large"
            name={propsnames.account}
            title={'规则名称'}
          />
          <QueryButton size="large" title="查询"></QueryButton>
        </QueryRules>
        <MapQueryInput
          name={propsnames.orglist}
          title={'核算组织'}
        ></MapQueryInput>
      </Col>
    </ComponentHandler>
  );
};


export const QueryInput: React.FC<InputPropsType> = (props) => {
  const { name, title, Memo ,childrenState,cr} = props;
  const saveOnChangeValue = (e) => {
    const value = e.target.value;
    childrenState[name] = value;
  };
console.log(childrenState,childrenState[name],name);
  return (
    <Memo value={[childrenState[name]]}>
      <span>
        {title}:{childrenState[name]}
        state:{childrenState[name]}
        <Input  onChange={saveOnChangeValue}></Input>
      </span>
     </Memo>
  );
};



export const MapQueryInput: React.FC<InputPropsType> = (props) => {

  const { name, childrenState } = props;
  
  const saveOnChangeValue = (e) => {
    const value = e.target.value;
    childrenState[name] = value;
  };

  return (<div>
    <span> {"map"}</span>
    <Input onChange={saveOnChangeValue}></Input>
  </div>);
};

```

VMHooks全局响应式使用
```js

const {
  ComponentHandler,
  Component,
  VMHooks,
} = ReactVM('use');


type VMHooksType = {
  rootState: state; //获取根组件状态
  useVmExact: function; // Vm_exact+React.useMemo([])语法糖
  rootStateUpdate: function; //强制更新Compont组件
  Memo: React.FC; // react.memo语法糖
  vm_exact: function; //defineproty
  vm: function; //proxy
};


const {  useVmExact ,Memo ,  } = VMHooks;
const QueryInput: React.FC<InputPropsType> = (props) => {
  const { name, title } = props;
  const [state, useState] = React.useState<any>();
  const rootState = useVmExact('QueryInput', name, (val,diff,Control) => {
   //useState(val) //直接更新hooks状态
   //diff(useState) 比较前后值是否相同然后调用Hooks
   Control((next,pre)=>{
     useState(next); //回调前值后值
   })
  });

  const saveOnChangeValue = (e) => {
    const value = e.target.value;
    rootState.QueryInput[name] = value;
  };
  return (
    <Memo value={[rootState.QueryInput[name]]}>
      <span>
        {title}:{rootState.QueryInput[name]}
        state:{state}
        <Input {...props} onChange={saveOnChangeValue}></Input>
      </span>
    </Memo>
  );
};

//此组件依然触发QueryInput更新
const MapQueryInput: React.FC<InputPropsType> = (props) => {
  const saveOnChangeValue = (e) => {
    const value = e.target.value;
    rootState.QueryInput[name] = value;
  };

  return (
        <Input  onChange={saveOnChangeValue}></Input>
  );
};



```

语法糖说明:
ComponentHandler = InjectComponent + extendRootState 的语法糖 
Component = InitRootCompoent+extendParentState+extendRootState 的语法糖
useVME=vm_exact + react.useMemo(  [])的语法糖
useVM= vm+react.useMemo的语法糖
$memo= react.memo的语法糖
Memo 组件 =react.usememo (()=>compont ,[value]) 的语法糖