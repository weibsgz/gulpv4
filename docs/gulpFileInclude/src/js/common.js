import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';

// import Vue from 'vue';


// new Vue({
//   el: '#app',
//   render: (h) => h('h1', {}, 'Hello Vue'),
// });

console.log(path.join('/app/', '/dist/', '/js/'));
console.log(path.resolve('/app/', 'dist/', 'js/'));

new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(200);
  }, 3000);
}).then((res) => {
  console.log(res);
});

async function test() {
  await 200;
}

test().then((res) => {
  console.log(res);
});

function* generate() {
  yield 1;
  yield 2;
  yield 3;
}
let gen = generate();
for (let val of generate()) {
  console.log(val);
}

console.log(gen.next());

let arr1 = [1, 2, 3, 4, 5, 6];
console.log([...arr1]);

let set = new Set();

let map = new Map();
set.add(1);
set.add(2);
set.add(1);
console.log(set);
console.log(map);
let arr = Array.of(1, 2, 3, 4, 5);
console.log(arr);

let str = 'abcdefgh';
console.log(str.includes('i'));
let obj = Object.assign({}, { name: 'hello Object.assign common', age: 18 });
console.log(obj);

class Animal {
  length = 0;
  constructor() {}
  say() {
    console.log('Hi, dog');
  }
}
class Dog extends Animal {
  constructor() {
    super();
  }
  #_run() {
    console.log('this is private method...');
  }
  run() {
    console.log('Hi, running...');
  }
}

console.log(Symbol('common'));
