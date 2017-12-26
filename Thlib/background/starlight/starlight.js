starlight_background=Class(object);

starlight_background.prototype.init = function(){
	var self=this;
	//
	background.init(self,false);
	//resource;
	LoadTexture('starlight_ground','THlib/background/starlight/ground.png');
	LoadImage('starlight_ground','starlight_ground',0,0,256,256,0,0);
	LoadTexture('starlight','THlib/background/starlight/starlight.png');
	LoadImage('noir','starlight',488,0,22,512,0,0);
	SetImageCenter('noir',12,512);
	LoadImage('star1','starlight',0,0,256,256,0,0);
	LoadImage('star2','starlight',0,256,320,256,0,0);
	LoadImageFromFile('stair','THlib/background/starlight/stair.png');
	LoadImageFromFile('window','THlib/background/starlight/windows.png');
	SetImageState('noir','mul+add');
	SetImageState('star1','mul+add');
	SetImageState('star2','mul+add');
	SetImageState('stair','mul+alpha',Color(255,255,255,255));
	//set 3d camera && fog;
	Set3D('eye',-1.9,-3.3,-8.6);
	Set3D('at',-0.4,0.9,2.5);
	Set3D('up',1.24,1.1,0.1);
	Set3D('z',2.1,1000);
	Set3D('fovy',0.7);
	Set3D('fog',7,1000,Color(200,10,10,27));
	//
	self.list=[-1];
	self.liststart=1;
	self.listend=0;
	self.imgs=['noir','star1','star2','stair'-1];
	self.speed=0.1;
	self.interval=0.5;
	self.acc=self.interval;
	self.angle=0;
	self.z=0;
	for(var i=1;i<=1000;i++){ starlight_background.frame(self) }
	for(var j=1;j<=500;j++){
		var z=-3+0.04*self.angle;
		self.listend=self.listend+1;
		self.list[self.listend-1]=[4,self.angle,0,0,0,z-1];
		self.angle=self.angle+10;
	}
};

rnd=math.random;

starlight_background.prototype.script = function(){
	var self=this;
	self.z=self.z+self.speed/2;
	//-Set3D('eye',3.35*cos(self.frame/4),3.35*sin(self.frame/4),-8.6);
	//-Set3D('up',2*sin(self.frame/20),1.1,0.1);
	self.acc=self.acc+self.speed;
	if(self.acc>=self.interval){
		self.acc=self.acc-self.interval;
		self.acc=self.acc-self.interval;
		var a=0;
		var R=rnd(1.4,60);
		for(var _=1;_<=3;_++){
			a=rnd(0,360);
			x=R*cos(a);
			y=2+R*sin(a);
			self.listend=self.listend+1;
			self.list[self.listend-1]=[rnd(2,3), x,y,rnd()*0.6-0.3,-0.7-0.3*rnd(),rnd(-1,100)-1]
		}
		//-if(self.frame%2==0){
		var z=-3+0.04*self.angle;
		self.listend=self.listend+1;
		self.list[self.listend-1]=[4,self.angle,0,0,0,z-1]
		self.angle=self.angle+10;
		//-}
	}
	for(var i=self.liststart;i<=self.listend;i++){
		if(self.list[i-1][1-1]!=4) {
            self.list[i - 1][6 - 1] = self.list[i - 1][6 - 1] - self.speed;
        }else{
			self.list[i-1][6-1]=self.list[i-1][6-1]-self.speed/4;
		}
	}
	while(true){
		if(self.list[self.liststart-1][6-1]<-6) {
            self.list[self.liststart - 1] = nil;
            self.liststart = self.liststart + 1;
        }else{
            break;
		}
		if(self.list[self.liststart-1][1-1]==4){
			if(self.list[self.liststart-1][6-1]>4) {
                self.list[self.liststart - 1] = nil;
                self.liststart = self.liststart + 1;
            }else {
                    break;
			}
		}
	}
};

starlight_background.prototype.on_render = function(){
	var self=this;
	SetViewMode('3d');
	RenderClear(lstg.view3d.fog[3-1]);
	for(var j=0;j<=20;j++){
		var dz=j*40-math.mod(self.z,40);
//		starlight_background.draw_windows(0,0,-5+dz,35+dz);
	}
	for(var i=self.listend;i>=self.liststart;i+=-1){
		var p=self.list[i-1]
		if(p[1-1]~=4){
			Render(self.imgs[p[1-1]-1],p[2-1]+rnd(-0.1,0.1),p[3-1]+rnd(-0.1,0.1),p[4-1]*57,p[5-1]/2,abs(p[5-1]/2),p[6-1]);
		else;
//			Render_4_point(p[2-1],6,10,2,'stair',p[6-1]);
		}
	}
	SetViewMode('world');
}




function Render_4_point(angle,r,angle_offset,r_,imagename,z){
	var A_1 = angle+angle_offset;
	var R_1 = r-r_;
	var x1,x2,x3,x4,y1,y2,y3,y4;
	x1=(r)*cos(A_1);
	y1=(r)*sin(A_1);

	x2=(r)*cos(angle);
	y2=(r)*sin(angle);

	x3=(R_1)*cos(angle);
	y3=(R_1)*sin(angle);

	x4=(R_1)*cos(A_1);
	y4=(R_1)*sin(A_1);
	Render4V(imagename,x1,y1,z,x2,y2,z,x3,y3,z,x4,y4,z);
}


starlight_background.draw_windows = function(x,y,z1,z2){
	var r=45;
	var a=0;
	for(var _=1;_<=12;_++){
		Render4V('window',
		x+r*cos(a-15),y+r*sin(a-15),z1,
		x+r*cos(a+15),y+r*sin(a+15),z1,
		x+r*cos(a+15),y+r*sin(a+15),z2,
		x+r*cos(a-15),y+r*sin(a-15),z2);
		a=a+30;
	}
}
