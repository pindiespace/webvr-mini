#version 330 core

layout(location=0) in vec3 in_position;
layout(location=2) in vec3 in_normal;
layout(location=8) in vec2 in_texcoord;

out vec4 v2f_positionW; // Position in world space.
out vec4 v2f_normalW; // Surface normal in world space.
out vec2 v2f_texcoord;

// Model, View, Projection matrix.
uniform mat4 ModelViewProjectionMatrix;
uniform mat4 ModelMatrix;

void main()
{
    gl_Position = ModelViewProjectionMatrix * vec4(in_position, 1);

    v2f_positionW = ModelMatrix * vec4(in_position, 1); 
    v2f_normalW = ModelMatrix * vec4(in_normal, 0);
    v2f_texcoord = in_texcoord;
}