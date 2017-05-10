/**
 * Created by Exbo on 2017/5/7.
 */

function LuaVarProxy(parent,name){
    this.base=parent;
}
function LuaThread(){
    this.proxies=[];
    this.scopes=[];
}
LuaThread.prototype.push=function(){
    this.proxies.push(JLuaP);
    this.scopes.push(JLuaR);
};
LuaThread.prototype.pop=function(){
    JLuaP=this.proxies.pop();
    JLuaR=this.scopes.pop();
};

function LuaScope(parent){
    this.parent=parent;
    this.locals={};
    this.proxy={};
    this.codes=[];
}
LuaScope.prototype.makeProxy=function(){

};

var JLua={};
var JLuaP={};
var JLuaR={};
var JLuaT={};

JLua._std_make_function=function(a){
    JLua._temp_function=a;
    JLua._temp_function.JLuaR=JLuaR;
};

JLua._std_lua_call=function(){
    JLuaT=JLuaT||new LuaThread();
    JLuaT.push();
    JLuaR=new LuaScope(arguments.callee.JLuaR);

};

JLua._local=function(sName){
    JLuaR.locals[sName]=0;
};


JLua._expressions={};
JLua._expression_compile_function=function(v){

};
JLua.compile=function(v){

};