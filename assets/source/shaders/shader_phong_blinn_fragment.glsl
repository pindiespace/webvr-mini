#version 330
layout(location = 0) out vec4 out_color;

uniform vec3 light_position;
uniform vec3 eye_position;
uniform int material_shininess;
uniform float material_kd;
uniform float material_ks;

in vec3 world_pos;
in vec3 world_normal;

void main(){
	
	vec3 L = normalize( light_position - world_pos);
	vec3 V = normalize( eye_position - world_pos);

	float difuza = max(0, dot(L,world_normal));

	vec3 H = normalize(L + V );

	float speculara = 0;

	if( dot(L,world_normal) > 0.0)
	{

	     speculara =   pow( max(0, dot( H, world_normal)), material_shininess);
	}	

	float light = difuza + speculara;
	
	out_color = vec4(light,light, light,1);
}