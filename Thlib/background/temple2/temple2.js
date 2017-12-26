var temple2_background=Class(object);
LoadImageFromFile('temple2_step','THlib/background/temple2/t2_step.png');
LoadImageFromFile('temple2','THlib/background/temple2/t2_o3.png');
LoadImageFromFile('temple2_torii','THlib/background/temple2/t2_torii.png');
LoadImageFromFile('temple2_fog','THlib/background/temple2/t2_fog.png');
LoadImageFromFile('temple2_ground','THlib/background/temple2/t2_bg2.png');
temple2_background.prototype.init = function(){
	var self=this;
	background.init(self,false);

	//Set3D('z',1.8,20);
	Set3D('z',1.8,11.1);
	Set3D('eye',0,0.8,-4.1);
	Set3D('at',0,0,0);
	Set3D('up',0,1,0);
	Set3D('fovy',1.75);
	//Set3D('fog',0,18,Color(0x00FFFFFF));
	Set3D('fog',3.8,6.5,Color(0x00DDDDDD));
	self.yos=0;
	self.speed=0.004;
};

temple2_background.prototype.script = function(){
	var self=this;
	self.yos=self.yos+self.speed;
};

temple2_background.prototype.on_render = function(){
	var self=this;
	SetViewMode('3d');
	RenderClear(lstg.view3d.fog[3-1]);
	var y=self.yos%1;
	var y2=self.yos%10;
	for(var i=-5;i<=4;i++){
		Render4V('temple2_step',-1.5,1-y+i,1-y+i,1.5,1-y+i,1-y+i,1.5,0-y+i,0-y+i,-1.5,0-y+i,0-y+i);
		Render4V('temple2_ground',-4.5,1-y+i,1-y+i,-1.5,1-y+i,1-y+i,-1.5,0-y+i,0-y+i,-4.5,0-y+i,0-y+i);
		Render4V('temple2_ground',1.5,1-y+i,1-y+i,4.5,1-y+i,1-y+i,4.5,0-y+i,0-y+i,1.5,0-y+i,0-y+i);
		Render4V('temple2_ground',-8.5,1-y+i,1-y+i,-4.5,1-y+i,1-y+i,-4.5,0-y+i,0-y+i,-8.5,0-y+i,0-y+i);
		Render4V('temple2_ground',4.5,1-y+i,1-y+i,8.5,1-y+i,1-y+i,8.5,0-y+i,0-y+i,4.5,0-y+i,0-y+i);
	}
	Render4V('temple2',-4,8,2.8,4,8,2.8,4,2,3,-4,2,3);
	SetViewMode('world');
};
