function* _readline() {
  console.log('factoryCount');
  yield "2";
  console.log('linkCount');
  yield "1";
  console.log('distances');
  yield "1 2 13";
  console.log('entityCount');

}

var _readlineGen = _readline();

function readline() {
  return _readlineGen.next().value;
}
