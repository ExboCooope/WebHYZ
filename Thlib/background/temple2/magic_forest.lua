temple2_background=Class(background)

function temple2_background:init()
	background.init(self,false)
	LoadImageFromFile('temple2_step','THlib\\background\\temple2\\t2_step.png')
	LoadImageFromFile('temple2','THlib\\background\\temple2\\t2_o3.png')
	Set3D('z',1.8,4.5)
	Set3D('eye',0,0,-5)
	Set3D('at',0,0,0)
	Set3D('up',0,1,0)
	Set3D('fovy',0.35)
	Set3D('fog',0,0,Color(0x00000000))
	self.yos=0
	self.speed=0.004
end

function temple2_background:frame()
	self.yos=self.yos+self.speed
end

function temple2_background:render()
	SetViewMode'3d'
	RenderClear(lstg.view3d.fog[3])
	local y=self.yos%1
	for i=-1,2 do
		Render4V('temple2_step',-1,1-y+i,1-y+i,1,1-y+i,1-y+i,1,0-y+i,0-y+i,-1,0-y+i,0-y+i)
	end

	SetViewMode'world'
end
