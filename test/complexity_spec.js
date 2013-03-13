describe('Password Complexity', function(){
  var complexity = component('password-complexity');

  it('should return false for empty passwords', function(){
    expect(complexity("")).to.equal(false);
  });

});