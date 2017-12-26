var stage3bg=Class(object);
LoadImageFromFile('stage03a','THlib/background/hongmoguan/stage03a.png');
LoadImageFromFile('stage03b','THlib/background/hongmoguan/stage03b.png');
LoadImageFromFile('stage03f','THlib/background/hongmoguan/stage03f.png');
LoadImageFromFile('stage3light','THlib/background/hongmoguan/stage03light.png');

stage3bg.prototype.init = function(){
	var self=this;
	//
	background.init(self,false);
	//resource;
	//set 3d camera && fog;
	Set3D('eye',0,5.2,-12);
	Set3D('at',0,0,-1.1);
	Set3D('up',0,1,0);
	Set3D('z',1,100);
	Set3D('fovy',0.6);
	Set3D('fog',5.7,20.0,Color(200,0,0,0));
	//
	self.speed=0.01;
	self.z=0;
};

stage3bg.prototype.script = function(){
	var self=this;
	self.z=self.z+self.speed;
};

stage3bg.prototype.on_render = function(){
	var self=this;
	SetViewMode('3d');
	for(var j=-2;j<=3;j++){
		var dz=6*j-math.mod(self.z,6);
		stage3bg.renderground(dz);
		stage3bg.renderfloor(dz);
		stage3bg.renderwall(dz,-2.5,2.9);
		stage3bg.renderwall(dz,2.5,2.9);
		stage3bg.light(self.frame,dz,2.49,2.9);
		stage3bg.light(self.frame,dz,-2.49,2.9);
	}
	SetViewMode('world');
};

stage3bg.renderground = function(z){
	Render4V('stage03a',-2.5,0,z+1,2.5,0,z+1,2.5,0,z-1,-2.5,0,z-1);
	Render4V('stage03a',-2.5,0,z+3,2.5,0,z+3,2.5,0,z+1,-2.5,0,z+1);
	Render4V('stage03a',-2.5,0,z-1,2.5,0,z-1,2.5,0,z-3,-2.5,0,z-3);
};
stage3bg.renderfloor = function(z){
	Render4V('stage03f',-1,0,z+1,1,0,z+1,1,0,z-1,-1,0,z-1);
	Render4V('stage03f',-1,0,z+3,1,0,z+3,1,0,z+1,-1,0,z+1);
	Render4V('stage03f',-1,0,z-1,1,0,z-1,1,0,z-3,-1,0,z-3);
};

stage3bg.renderwall = function(z,x,y){
	Render4V('stage03b',x,y,z,  x,y,z+3,x,0,z+3,x,0,z);
	Render4V('stage03b',x,y,z-3,x,y,z,  x,0,z,  x,0,z-3);
};

stage3bg.light = function(timer,z,x,y){
	SetImageState('stage3light','mul+add',Color(255,255,140,0));
	if(timer%3==0){
		Render4V('stage3light',x,y,z,  x,y,z+3,x,0,z+3,x,0,z);
		Render4V('stage3light',x,y,z-3,x,y,z,  x,0,z,  x,0,z-3);
	}
	SetImageState('stage3light','mul+add',Color(255,255,80,0));
	if((timer%2)>>0==0){
		Render4V('stage3light',x,y,z,  x,y,z+3,x,0,z+3,x,0,z);
		Render4V('stage3light',x,y,z-3,x,y,z,  x,0,z,  x,0,z-3);
	}
	SetImageState('stage3light','mul+add',Color(255,255,100,0));
	if((timer%17)>>0==0){
		Render4V('stage3light',x,y,z,  x,y,z+3,x,0,z+3,x,0,z);
		Render4V('stage3light',x,y,z-3,x,y,z,  x,0,z,  x,0,z-3);
	}
	SetImageState('stage3light','mul+add',Color(255,255,60,0));
	if((timer%9)>>0==0){
		Render4V('stage3light',x,y,z,  x,y,z+3,x,0,z+3,x,0,z);
		Render4V('stage3light',x,y,z-3,x,y,z,  x,0,z,  x,0,z-3);
	}
};








