stairs_background=Class(object)

function stairs_background:init()
	--
	background.init(self,false)
	--resource
	LoadImageFromFile('stair','THlib\\background\\stairs\\stair.png')
	LoadImageFromFile('back','THlib\\background\\stairs\\back.png')
	--set 3d camera and fog
	Set3D('eye',0,0,-5)
	Set3D('at',0,0,10)
	Set3D('up',0,1,0)
	Set3D('z',1,10000)
	Set3D('fovy',0.7)
	Set3D('fog',7,20,Color(0xFFC0C0C0))
	--

end


function stairs_background:frame()

end

function stairs_background:render()
	SetViewMode'3d'
	Render('back',0,0,0,1,1,3)
	local R=2
	for angle=1000,0,-10 do
		local z=-3+0.04*angle
		Render_4_point(angle,2,10,0.6,'stair',z)
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
