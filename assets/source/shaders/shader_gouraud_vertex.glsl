#version 330

layout(location = 0) in vec3 in_position;		
layout(location = 1) in vec3 in_normal;		

uniform mat4 model_matrix, view_matrix, projection_matrix;
uniform vec3 light_position;
uniform vec3 eye_position;
uniform int material_shininess;
uniform float material_kd;
uniform float material_ks;

out float light;

void main(){
	
	vec3 world_position = mat3(model_matrix) * in_position;
	vec3 world_normal = normalize(mat3(model_matrix) * in_normal);

	
	vec3 L = normalize(light_position - world_position);
	vec3 V = normalize(eye_position - world_position);

	float diffuse = material_kd*max(0, dot(L,world_normal));

	vec3 H = normalize(L + V );
	vec3 R = -reflect(L,world_normal);

	float speculara = material_kd * pow( max(0, dot( H, world_normal)), material_shininess);

	light = diffuse + speculara;
	
	
	gl_Position = projection_matrix*view_matrix*model_matrix*vec4(in_position,1); 
}
