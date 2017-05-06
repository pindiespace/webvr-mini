// -- Cone.cs -- //
//-- use polar coordinates for draw all vertices --//

using UnityEngine;
using System.Collections;

[RequireComponent (typeof (MeshCollider))]
[RequireComponent (typeof (MeshFilter))]
[RequireComponent (typeof (MeshRenderer))]

public class Cone : MonoBehaviour {
        
		public float lenght = 2.0f;
		public float radius = 2.0f;
		public int sections = 20;
	
		float step;
		float cAngle;
	
		
	
        public bool sharedVertices = false;
        
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
				Debug.LogError("num of sections must be 3 or more");
				return;
			}
		
			
			step = (2 *Mathf.PI) / sections;
			cAngle = 2*Mathf.PI; //-- start in 360 and going decrement
			
		
			// -- each point along circle --plus center  & vertex peak--//
			Vector3 []cVertices = new Vector3[sections+1+1];	
			
			//--First vertex --//
			cVertices[0] = new Vector3(0,0,0); // center of circle
		
			//--Generate vertices remains --//
			for(int i=1; i<(sections+1); i++){
				cVertices[i] = new Vector3(Mathf.Sin(cAngle)*radius, Mathf.Cos(cAngle)*radius, 0);
				cAngle += step;
			}
		
			//--Peak cone vertex --//
			cVertices[cVertices.Length-1] = new Vector3(0,0,lenght); // center of circle
			
		
		
			int idx = 1;
			int indices = (sections)*3; // Only for circle triangles
			indices *=2; //-- X2 for every triangle in wall of cone
		
			// -- Already have vertices, now build triangles --//
			int []cTriangles = new int[indices]; // one triagle for each section (has 3 vertex per triang)
			
			Debug.Log(cVertices[0].x + "   "+cVertices[0].z + "   " +cVertices[0].z);
			
		
			//-- Fill Circle mesh --//
			for(int i=0; i<(indices*.5); i+=3){
				cTriangles[i] = 0; //center of circle
				cTriangles[i+1] = idx; //next vertex
				
			
				if(i >= (indices*.5 - 3)){
				//-- if is the last vertex (one loop)
					cTriangles[i+2] = 1;	
				}else{
				//-- if is the next point --//
					cTriangles[i+2] = idx+1; //next next vertex	
				}
				idx++;
				
			
			}
		
		
			//-- Reset idx (indices pointer)-- //
			idx = 1;
			//--Fill cone wall--//
			for(int i=(int)(indices*.5); i<(indices); i+=3){
				
				cTriangles[i] = idx; //next vertex
				cTriangles[i+1] = cVertices.Length-1; // Peak vertex
				
			
				if(i >= (indices- 3)){
				//-- if is the last vertex (one loop)
					cTriangles[i+2] = 1; // Peak vertex;	
				}else{
				//-- if is the next point --//
					cTriangles[i+2] = idx+1; //next next vertex	
				}
			
				idx++;
				
			
			}
		
				
			mesh.vertices = cVertices;
			mesh.triangles = cTriangles;
		
		
		
		
				GetComponent<Renderer>().sharedMaterial = new Material(Shader.Find("Diffuse")); // REF1
                GetComponent<Renderer>().sharedMaterial.color = Color.green;
                mesh.RecalculateNormals();
                mesh.RecalculateBounds();
                mesh.Optimize();
        }
        
}