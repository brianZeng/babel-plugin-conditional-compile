export default function (babel){
    let types=babel.types,mapKeys=[],mapFuncs;
    return {
      visitor:{
        Program(path,PluginPass){
          let {define}=PluginPass.opts;
          if(define){
            mapKeys=Object.getOwnPropertyNames(define);
            mapFuncs=mapKeys.map(key=>mapAst(define[key],types))
          }
        },
        Identifier(path){
          let i=mapKeys.indexOf(path.node.name);
          if(i!==-1){
            path.replaceWith(mapFuncs[i]())
          }
        },
        Conditional:{
          exit(path){
            let res=path.get('test').evaluate();
            if(res.confident){
              let replacement=path.get(res.value?'consequent':'alternate');
              let {node,scope}=replacement;
              if (scope.path !== replacement) {
                //not a block
                path.replaceWith(node || types.emptyStatement())
              }
              else if (Object.getOwnPropertyNames(scope.bindings).length != 0) {
                path.replaceWith(node||types.emptyStatement())
              }
              else{
                //no declaration in scope
                path.replaceWithMultiple(node.body);
              }
            }
          }
        }
      }
    }
}

function mapAst(val,types){
  let type= typeof val;
  switch (type){
    case "string":
      return ()=>types.StringLiteral(val+'');
    case "number":
      return ()=>types.NumericLiteral(+val);
    case "null":
      return ()=>types.NullLiteral();
    case "undefined":
      return ()=>types.Identifier('undefined');
    case "boolean":
      return ()=>types.BooleanLiteral(!!val);
    default:
      throw Error(`not support:${type} as conditional variable`);
  }
}