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
