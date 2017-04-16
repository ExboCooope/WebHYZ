# WebHYZ
Multiplayer Touhou STG on browser

What's new compared with IFE_WPTG?
-
WebHYZ is based on the developing JavaSTaGe engine
1. Added local multiplayer support
2. Game can now have two frames, which can transform between one frame dynamically
3. Added hyz*** functions which can specify frame-side, stg*** functions now use the same frame-side in caller script object
4. Added hyz system functions which can handle player charge/combo/chain-score
5. Added 2D primitive shader, this shader will call object.on_render function with webglcontext
6. Added object.frame which starts by 1 and increase each frame
7. Added object.on_move user function which is called after tick-move before position binding
8. Added object.beforehit user function which is called after position binding before hit check
9. Added lua*** function for luastg similar function
10. Added fog for 3D shader.
11. Added WGLA.* for basic webgl object. WGLA._WGLBuffer is used in curve laser
12. Added font system using sprite shader

What's on progress?
-
1. Adding <player> remilia
2. Developing standard player script
3. Adding curve laser dummy hitbox objects
4. Adding curve laser texture management
5. Test Framebuffer self rendering by texture replacement (for boss effect)
6. Add more blend mode
