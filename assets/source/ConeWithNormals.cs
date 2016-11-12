// -- Cone.cs -- //
//-- use polar coordinates for draw all vertices --//

using UnityEngine;
using System.Collections;

[RequireComponent (typeof (MeshCollider))]
[RequireComponent (typeof (MeshFilter))]
[RequireComponent (typeof (MeshRenderer))]

public class ConeWithNormals : MonoBehaviour {
        
		public float lenght = 5.0f;
		public float radius = 2.0f;
		public int sections = 8;
		public bool transparent = false;
	
		float step;
		float cAngle;

        
        public void Rebuild(){
                MeshFilter meshFilter = GetComponent<MeshFilter>();
                if (meshFilter==null){
                        Debug.LogError("MeshFilter not found!");
                        return;
                }
                
				Mesh mesh = meshFilter.sharedMesh;
                if (mesh == null){
                        meshFilter.mesh = new Mesh();
                        mesh = meshFilter.sharedMesh;
                }
                mesh.Clear();
                
		
			if(sections < 3){
				Debug.LogError("Numbers of sections must be 3 or more");
				return;
			}
		
			
			
			cAngle = 2*Mathf.PI; //-- start in 360 and going decrement
			step = cAngle / sections;
		
			// -- each point along circle --plus center  & vertex peak--//
			int vortexs = (sections)*3*2;
			Vector3 []cVertices = new Vector3[vortexs];	
			
		
		
		
			//--Generate vertices remains --//
			for(int i=0; i<(vortexs*.5); i+=3){
				//--i'll use three vertex per sections (non shared vertices)--//
				cVertices[i] = new Vector3(0,0,0); // center of circle
				cVertices[i+1] = new Vector3(Mathf.Sin(cAngle)*radius, Mathf.Cos(cAngle)*radius, 0);
				cAngle += step;
				cVertices[i+2] = new Vector3(Mathf.Sin(cAngle)*radius, Mathf.Cos(cAngle)*radius, 0);
			
			}
		
		
			//-- reset current angle -- //
			cAngle = 2*Mathf.PI;
		
			//--Generate vertices for cone wall --//
			for(int i=(int)(vortexs*.5); i<(vortexs); i+=3){
				//--i'll use three vertex per sections (non shared vertices)--//
				cVertices[i] = new Vector3(Mathf.Sin(cAngle)*radius, Mathf.Cos(cAngle)*radius, 0);
				cVertices[i+1] = new Vector3(0,0,lenght); // peek vertex
				cAngle += step;
				cVertices[i+2] = new Vector3(Mathf.Sin(cAngle)*radius, Mathf.Cos(cAngle)*radius, 0);
			
			}
			
		 
		
			// -- Already have vertices, now build triangles --//
			int []cTriangles = new int[vortexs]; // one triagle for each section (has 3 vertex per triang)
			
		
		
			//-- Fill Cone mesh --//
			for(int i=0; i<vortexs; i++){
				cTriangles[i] = i; // consecutive indices is correct vertex
				
			}
		
		
				
			mesh.vertices = cVertices;
			mesh.triangles = cTriangles;
			
			string shaderStr;
			if (transparent){
				shaderStr = "Transparent/Diffuse";
			}else{
				shaderStr = "Diffuse";			
			}
			GetComponent<Renderer>().sharedMaterial = new Material(Shader.Find(shaderStr)); // REF1
			GetComponent<Renderer>().sharedMaterial.SetColor("_Color",new Color(0.1f,1.0f,0.5f,0.2f));
            mesh.RecalculateNormals();
            mesh.RecalculateBounds();
            mesh.Optimize();
        }
        
}