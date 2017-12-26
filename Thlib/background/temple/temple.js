var temple_background=Class(object);
LoadImageFromFile('temple_road','THlib/background/temple/road.png');
LoadImageFromFile('temple_ground','THlib/background/temple/ground.png');
LoadImageFromFile('temple_pillar','THlib/background/temple/pillar.png');

temple_background.prototype.init = function(){
	var self=this;
	//
	background.init(self,false);
	//resource;
	//set 3d camera && fog;
	Set3D('eye',0,2.5,-4);
	Set3D('at',0,0,0);
	Set3D('up',0,1,0);
	Set3D('z',1,10);
	Set3D('fovy',0.6);
	Set3D('fog',5,10,[1,1,1,1]);
	//
	self.speed=0.02;
	self.z=0;
    self.layer=150;
};

temple_background.prototype.script = function(){
	var self=this;
	self.z=self.z+self.speed;
};

temple_background.prototype.on_render = function(){
	var self=this;
	SetViewMode('3d');
	for(var j=0;j<=4;j++){
		var dz=j*2-math.mod(self.z,2);
		Render4V('temple_ground', 0.5,0,dz, 2.5,0,dz, 2.5,0,-2+dz, 0.5,0,-2+dz);
		Render4V('temple_ground',-0.5,0,dz,-2.5,0,dz,-2.5,0,-2+dz,-0.5,0,-2+dz);
		Render4V('temple_road',-1,0,dz,1,0,dz,1,0,-2+dz,-1,0,-2+dz);
	}
	for(var j=3;j>=-1;j+=-1){
		var dz=j*2-math.mod(self.z,2);
		temple_background.draw_pillar( 0.85,dz+0.2,1.8,0,0.15);
		temple_background.draw_pillar(-0.85,dz+0.2,1.8,0,0.15);
	}
	SetViewMode('world');
};

temple_background.draw_pillar = function(x,z,y1,y2,r){
	var a=0;
	var d=r*cos(22.5);
	var eyex,eyez;
	eyex=lstg.view3d.eye[0]-x;
	eyez=lstg.view3d.eye[2]-z;
	for(var _=1;_<=8;_++){
		if(d*cos(a)*eyex+d*sin(a)*eyez-d*d>0){
			var blk=255*(((1-cos(a)*SQRT2_2+sin(a)*SQRT2_2)*0.5)+0.0625);
			SetImageState('temple_pillar','',Color(255,blk,blk,blk));
			Render4V('temple_pillar',
			x+r*cos(a-22.5),y1,z+r*sin(a-22.5),
			x+r*cos(a+22.5),y1,z+r*sin(a+22.5),
			x+r*cos(a+22.5),y2,z+r*sin(a+22.5),
			x+r*cos(a-22.5),y2,z+r*sin(a-22.5));
		}
		a=a+45;
	}
};
