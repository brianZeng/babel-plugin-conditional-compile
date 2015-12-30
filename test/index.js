/**
 * Created by brian on 12/30/15.
 */
import {babel} from './babel-core';
import {default as plugin} from '../src';
function compileToEqual(ori,result,define={},msg){
  let transformedCode=babel.transform(ori+'',{
    compact:true,
    plugins:[
      [plugin,{define}]
    ]}).code,oriCode=babel.transform(result+'',{compact:true}).code;
  console.assert(transformedCode==oriCode,msg||'expect code error')
}

compileToEqual(function a(){
  if(IS_DEV){
    console.log('dev');
  }
},function a(){
  console.log('dev')
},{IS_DEV:1},'simple');
compileToEqual(function if_else(){
  if(IS_DEV){
    a()
  }else {
    b()
  }
},function if_else(){
  b()
},{IS_DEV:false},'if_else');
compileToEqual(function t(){
  if(IS_DEV){
    a()
  }else if(IS_PUB) {
    b()
  }
  else{

  }
},function t(){
  if(IS_DEV){
    a();
  }else{
    b()
  }
},{IS_PUB:true},'if_elseif');
compileToEqual(function t(){
  if(IS_DEV){
    a()
  }else if(IS_PUB) {
    b()
  }
  else{
    c()
  }
},function t(){
  c()
},{IS_PUB:false,IS_DEV:false},'if_else_else');
compileToEqual(function t(){
  if(IS_DEV){
    var a='dev';
  }
  else a='pub';
  log(a);
},function t(){
  var a='dev';
  log(a);
},{IS_DEV:1},'lift scope');
compileToEqual(`function t(){
  if(IS_DEV){
    let a=2;
  }else{
    let a=3;
  }
}`,`function t(){
  {
    let a=3;
  }
}`,{IS_DEV:false},'keep scope');
