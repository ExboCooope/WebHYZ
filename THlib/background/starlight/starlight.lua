starlight_background=Class(object)

function starlight_background:init()
	--
	background.init(self,false)
	--resource
	LoadTexture('starlight_ground','THlib\\background\\starlight\\ground.png')
	LoadImage('starlight_ground','starlight_ground',0,0,256,256,0,0)
	LoadTexture('starlight','THlib\\background\\starlight\\starlight.png')
	LoadImage('noir','starlight',488,0,22,512,0,0)
	SetImageCenter('noir',12,512)
	LoadImage('star1','starlight',0,0,256,256,0,0)
	LoadImage('star2','starlight',0,256,320,256,0,0)
	LoadImageFromFile('stair','THlib\\background\\starlight\\stair.png')
	LoadImageFromFile('window','THlib\\background\\starlight\\windows.png')
	SetImageState('noir','mul+add')
	SetImageState('star1','mul+add')
	SetImageState('star2','mul+add')
	SetImageState('stair','mul+alpha',Color(255,255,255,255))
	--set 3d camera and fog
	Set3D('eye',-1.9,-3.3,-8.6)
	Set3D('at',-0.4,0.9,2.5)
	Set3D('up',1.24,1.1,0.1)
	Set3D('z',2.1,1000)
	Set3D('fovy',0.7)
	Set3D('fog',7,1000,Color(200,10,10,27))
	--
	self.list={}
	self.liststart=1
	self.listend=0
	self.imgs={'noir','star1','star2','stair'}
	self.speed=0.1
	self.interval=0.5
	self.acc=self.interval
	self.angle=0
	self.z=0
	for i=1,1000 do starlight_background.frame(self) end
	for j=1,500 do
		local z=-3+0.04*self.angle
		self.listend=self.listend+1
		self.list[self.listend]={4,self.angle,0,0,0,z}
		self.angle=self.angle+10
	end
end

rnd=math.random

function starlight_background:frame()
	self.z=self.z+self.speed/2
	---Set3D('eye',3.35*cos(self.timer/4),3.35*sin(self.timer/4),-8.6)
	---Set3D('up',2*sin(self.timer/20),1.1,0.1)
	self.acc=self.acc+self.speed
	if self.acc>=self.interval then
		self.acc=self.acc-self.interval
		self.acc=self.acc-self.interval
		local a=0
		local R=rnd(1.4,60)
		for _=1,3 do
			a=rnd(0,360)
			x=R*cos(a)
			y=2+R*sin(a)
			self.listend=self.listend+1
			self.list[self.listend]={rnd(2,3), x,y,rnd()*0.6-0.3,-0.7-0.3*rnd(),rnd(-1,100)}
		end
		---if self.timer%2==0 then
		local z=-3+0.04*self.angle
		self.listend=self.listend+1
		self.list[self.listend]={4,self.angle,0,0,0,z}
		self.angle=self.angle+10
		---end
	end
	for i=self.liststart,self.listend do
		if self.list[i][1]~=4 then
			self.list[i][6]=self.list[i][6]-self.speed
		else
			self.list[i][6]=self.list[i][6]-self.speed/4
		end
	end
	while true do
		if self.list[self.liststart][6]<-6 then
			self.list[self.liststart]=nil
			self.liststart=self.liststart+1
		else break
		end
		if self.list[self.liststart][1]==4 then
			if self.list[self.liststart][6]>4 then
				self.list[self.liststart]=nil
				self.liststart=self.liststart+1
			else break
			end
		end
	end
end

function starlight_background:render()
	SetViewMode'3d'
	RenderClear(lstg.view3d.fog[3])
	for j=0,20 do
		local dz=j*40-math.mod(self.z,40)
--		starlight_background.draw_windows(0,0,-5+dz,35+dz)
	end
	for i=self.listend,self.liststart,-1 do
		local p=self.list[i]
		if p[1]~=4 then
			Render(self.imgs[p[1]],p[2]+rnd(-0.1,0.1),p[3]+rnd(-0.1,0.1),p[4]*57,p[5]/2,abs(p[5]/2),p[6])
		else
--			Render_4_point(p[2],6,10,2,'stair',p[6])
		end
	end
	SetViewMode'world'
end




function Render_4_point(angle,r,angle_offset,r_,imagename,z)
	local A_1 = angle+angle_offset
	local R_1 = r-r_
	local x1,x2,x3,x4,y1,y2,y3,y4
	x1=(r)*cos(A_1)
	y1=(r)*sin(A_1)

	x2=(r)*cos(angle)
	y2=(r)*sin(angle)

	x3=(R_1)*cos(angle)
	y3=(R_1)*sin(angle)

	x4=(R_1)*cos(A_1)
	y4=(R_1)*sin(A_1)
	Render4V(imagename,x1,y1,z,x2,y2,z,x3,y3,z,x4,y4,z)
end


function starlight_background.draw_windows(x,y,z1,z2)
	local r=45
	local a=0
	for _=1,12 do
		Render4V('window',
		x+r*cos(a-15),y+r*sin(a-15),z1,
		x+r*cos(a+15),y+r*sin(a+15),z1,
		x+r*cos(a+15),y+r*sin(a+15),z2,
		x+r*cos(a-15),y+r*sin(a-15),z2)
		a=a+30
	end
end
