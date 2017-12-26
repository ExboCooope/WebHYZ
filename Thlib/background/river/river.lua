river_background=Class(object)

function river_background:init()
	background.init(self,false)
	LoadImageFromFile('river_tree','THlib\\background\\river\\river_tree.png')
	LoadTexture('river_bank','THlib\\background\\river\\river_bank.png')
	LoadImage('river_left_bank','river_bank',0,0,128,256)
	LoadImage('river_right_bank','river_bank',128,0,128,256)
	LoadImageFromFile('river_water','THlib\\background\\river\\river_water.png')
	SetImageState('river_water','',Color(0x40FFFFFF))
	LoadImageFromFile('river_bed','THlib\\background\\river\\river_bed.png')
	--set camera
	Set3D('eye',0.00,1.60,-1.40)
	Set3D('at',0.00,0.00,-0.20)
	Set3D('up',0.00,1.00,0.00)
	Set3D('fovy',0.62)
	Set3D('z',1.00,3.70)
	Set3D('fog',2.50,3.70,Color(0,255,0,0))
	--
	self.zos=0
	self.speed=0.004
	--
	--New(camera_setter)
end

function river_background:frame()
	self.zos=self.zos+self.speed
end

function river_background:render()
	SetViewMode'3d'
	RenderClear(lstg.view3d.fog[3])
	local z=self.zos%1
	for i=-1,2 do
		Render4V('river_bed',0.2,-0.6,1-z+i, 1.2,-0.6,1-z+i, 1.2,-0.6,0-z+i,0.2,-0.6,0-z+i)
		Render4V('river_bed',0.2,-0.6,1-z+i,-0.8,-0.6,1-z+i,-0.8,-0.6,0-z+i,0.2,-0.6,0-z+i)
	end
	for i=-1,2 do
		Render4V('river_water',-0.2,-0.4,1-z+i, 0.8,-0.4,1-z+i, 0.8,-0.4,0-z+i,-0.2,-0.4,0-z+i)
		Render4V('river_water',-1.2,-0.4,1-z+i,-0.2,-0.4,1-z+i,-0.2,-0.4,0-z+i,-1.2,-0.4,0-z+i)
	end
	for i=-1,2 do
		Render4V('river_water',0,-0.2,1-z+i, 1,-0.2,1-z+i, 1,-0.2,0-z+i,0,-0.2,0-z+i)
		Render4V('river_water',-1,-0.2,1-z+i,0,-0.2,1-z+i,0,-0.2,0-z+i,-1,-0.2,0-z+i)
	end
	for i=-1,1 do
		Render4V('river_left_bank',-0.75,0,1-z+i,-0.25,0,1-z+i,-0.25,0,0-z+i,-0.75,0,0-z+i)
		Render4V('river_right_bank',0.25,0,1-z+i,0.75,0,1-z+i,0.75,0,0-z+i,0.25,0,0-z+i)
	end
	z=self.zos%2
	for i=-2,0,2 do
		Render4V('river_tree',-0.5,0.6,2-z+i,0,0.6,2-z+i,0,0.6,1-z+i,-0.5,0.6,1-z+i)
		Render4V('river_tree', 0.5,0.6,1-z+i,0,0.6,1-z+i,0,0.6,0-z+i, 0.5,0.6,0-z+i)
	end
	SetViewMode'world'
end
