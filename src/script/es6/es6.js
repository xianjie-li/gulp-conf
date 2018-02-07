let [one,two,three] = [1,2,3];

class Humen{
  //构造函数
  constructor(name,age){
    this.name=name;
    this.age=age;
  }
  output(){
    alert(`我叫${this.name},年是${this.age}`);
  }
  //静态方法
  static foo(){
    alert('这是一个静态方法');
  }
  //get & set
  get longName(){
    return 'long' + this.name
  }
  set longName(val){
    this.name = val
  }
}