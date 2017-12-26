stage3bg=Class(object)

function stage3bg:init()
	--
	background.init(self,false)
	--resource
	LoadImageFromFile('stage03a','THlib\\background\\hongmoguan\\stage03a.png')
	LoadImageFromFile('stage03b','THlib\\background\\hongmoguan\\stage03b.png')
	LoadImageFromFile('stage03f','THlib\\background\\hongmoguan\\stage03f.png')
	LoadImageFromFile('stage3light','THlib\\background\\hongmoguan\\stage03light.png')
	--set 3d camera and fog
	Set3D('eye',0,5.2,-12)
	Set3D('at',0,0,-1.1)
	Set3D('up',0,1,0)
	Set3D('z',1,100)
	Set3D('fovy',0.6)
	Set3D('fog',5.7,20.0,Color(200,0,0,0))
	--
	self.speed=0.01
	self.z=0
end

function stage3bg:frame()
	self.z=self.z+self.speed
end

function stage3bg:render()
	SetViewMode'3d'
	for j=-2,3 do
		local dz=6*j-math.mod(self.z,6)
		stage3bg.renderground(dz)
		stage3bg.renderfloor(dz)
		stage3bg.renderwall(dz,-2.5,2.9)
		stage3bg.renderwall(dz,2.5,2.9)
		stage3bg.light(self.timer,dz,2.49,2.9)
		stage3bg.light(self.timer,dz,-2.49,2.9)
	end
	SetViewMode'world'
end

function stage3bg.renderground(z)
	Render4V('stage03a',-2.5,0,z+1,2.5,0,z+1,2.5,0,z-1,-2.5,0,z-1)
	Render4V('stage03a',-2.5,0,z+3,2.5,0,z+3,2.5,0,z+1,-2.5,0,z+1)
	Render4V('stage03a',-2.5,0,z-1,2.5,0,z-1,2.5,0,z-3,-2.5,0,z-3)
end
function stage3bg.renderfloor(z)
	Render4V('stage03f',-1,0,z+1,1,0,z+1,1,0,z-1,-1,0,z-1)
	Render4V('stage03f',-1,0,z+3,1,0,z+3,1,0,z+1,-1,0,z+1)
	Render4V('stage03f',-1,0,z-1,1,0,z-1,1,0,z-3,-1,0,z-3)
end

function stage3bg.renderwall(z,x,y)
	Render4V('stage03b',x,y,z,  x,y,z+3,x,0,z+3,x,0,z)
	Render4V('stage03b',x,y,z-3,x,y,z,  x,0,z,  x,0,z-3)

end

function stage3bg.light(timer,z,x,y)
	SetImageState('stage3light','mul+add',Color(255,255,140,0))
	if timer%1.5==0 then
		Render4V('stage3light',x,y,z,  x,y,z+3,x,0,z+3,x,0,z)
		Render4V('stage3light',x,y,z-3,x,y,z,  x,0,z,  x,0,z-3)
	end
	SetImageState('stage3light','mul+add',Color(255,255,80,0))
	if timer%2==0 then
		Render4V('stage3light',x,y,z,  x,y,z+3,x,0,z+3,x,0,z)
		Render4V('stage3light',x,y,z-3,x,y,z,  x,0,z,  x,0,z-3)
	end
	SetImageState('stage3light','mul+add',Color(255,255,100,0))
	if timer%1.7==0 then
		Render4V('stage3light',x,y,z,  x,y,z+3,x,0,z+3,x,0,z)
		Render4V('stage3light',x,y,z-3,x,y,z,  x,0,z,  x,0,z-3)
	end
	SetImageState('stage3light','mul+add',Color(255,255,60,0))
	if timer%1.8==0 then
		Render4V('stage3light',x,y,z,  x,y,z+3,x,0,z+3,x,0,z)
		Render4V('stage3light',x,y,z-3,x,y,z,  x,0,z,  x,0,z-3)
	end
end








