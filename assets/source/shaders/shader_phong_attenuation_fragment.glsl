//Blinn-Phong reflection model wiath attenuation; Fragment Shader
//To keep it simple didn't add ambient and emissive lights;
//only diffuse and specular with white intensity
#version 330
layout(location = 0) out vec4 out_color;

uniform vec3 light_position;
uniform vec3 eye_position;

uniform int material_shininess;

uniform float material_kd;
uniform float material_ks;

//attenuation coefficients
uniform float att_kC;
uniform float att_kL;
uniform float att_kQ;

in vec3 world_pos;
in vec3 world_normal;

void main(){
    
    
	vec3 L = normalize( light_position - world_pos);//light direction
	vec3 V = normalize( eye_position - world_pos);//view direction

	float LdotN =  max(0, dot(L,world_normal));

	float diffuse = material_kd * LdotN;

	//attenuation
	float d = distance(light_position, world_pos);
	float att = 1.0 / (att_kC + d * att_kL + d*d*att_kQ);

	float specular = 0;

	if(LdotN > 0.0)
	{
	  vec3 H = normalize(L + V );//Halfway(Blinn-Phong)
    
	  specular = material_kd * pow(max(0, dot(H, world_normal)), material_shininess);
	}

	float light = att * diffuse + att * specular;

	//gamma correction
	float final_light = pow(light, 1/2.2);

	out_color = vec4(final_light, final_light, final_light,1);
}
