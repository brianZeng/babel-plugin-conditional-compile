#babel-plugin-conditional-compile
Evaluate If statement and remove unavailable code
## Conditional Compile
You may rewrite code like
```javascript
if(IS_DEV){
  console.log('track infomation')
}
var foo;
if(CODE_FOR_IE){
  foo=1;
}
else if(CODE_FOR_CHROME){
  foo=2;
}
```
But you don't want to log until it is published and
if you know the code target,you can just kick the redundant when published.
The code to publish for chrome will be like.
```javascript

var foo;

foo=2;

```

## Installation

```sh
$ npm install babel-plugin-conditional-compile --save-dev
```

## Usage

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["conditional-compile",{
    define:{
      IS_DEV:false,
      CODE_FOR_IE:true
    }
  }]
});
```
The example code above will become

```javascript

console.log('track infomation')

var foo;

foo=1;

```

## Options
The available options are
```
{
  define:{
    APP_VERSION:'1.0.0',
    IS_DEV:true
  },
  dropDebugger:false
}
```
* any variable same with key name in define object will be replace by its value
* when dropDebugger set true, the `debugger;` statement will be removed
