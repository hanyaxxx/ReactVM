

function proxy (obj,props,value){
  let pre=obj[props]
  Object.defineProperty(obj,props,{
    get(){
      return pre
    },
    set(value){
      pre=value
      new Proxy({},{
        get(_,prop,){
          return obj[prop]
        },
        set(_,props,value){
          obj[props]=value 
          
        }
      })
    }
  })

}

let obj={}

proxy(obj,'name')

obj.name='xxxxxx'

let obj2={...obj}

const copy=Object.assign({},obj)

let obj3 = obj.__proto__

console.log(obj3===obj)

obj3.name 

obj3.name='xxx2'
let obj4 = {}
obj4.__proto__ = obj3.__proto__

console.log(obj4 === obj)

obj4.name 

obj4.name='惺惺相惜先'