import LoadPool from  './load-pool';

export default class LoadModel extends LoadPool {

    /**
     * Base loader class.
     */

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'in LoadModel class' );

        super( init, util, glMatrix, webgl );

    }

    init () {

    }

    uploadModel ( loadObj, callback ) {

        // TODO: replace Sizzle with querySelector.

		var $ = Sizzle,
			getInput = function(sem, par) {
                var el = $("input[semantic="+sem+"]", par)[0];
                return $(el.getAttribute("source"), mesh)[0];
            },
            parseVals = function(el) {
				var strvals = el.textContent.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
                return strvals.split(/\s+/).map(parseFloat);
            },
            mesh = $("geometry > mesh", xml)[0],
			triangles = $("triangles", mesh)[0],
            polylist = $("polylist", mesh)[0],
			vrtInput = getInput("VERTEX", polylist),
			posInput = getInput("POSITION", vrtInput),
			nrmInput = getInput("NORMAL", polylist),
			nrmList = parseVals($("float_array", nrmInput)[0]),
			idxList = parseVals($("p", polylist)[0]),
			i, j, v, n;

		vertices = parseVals($("float_array", posInput)[0]);
		normals = [];
		indices = [];

		for (i=0;i<idxList.length;i+=6) {
			for (j=0;j<3;j++) {
				v = idxList[i + j * 2],
				n = idxList[i + j * 2 + 1];
				indices.push(v);
				normals[v*3] = nrmList[n*3];
				normals[v*3+1] = nrmList[n*3+1];
				normals[v*3+2] = nrmList[n*3+2];
			}
		}

		return {
			vertices: vertices,
			indices: indices,
			normals: normals
		};

    }

    createLoadObj ( waitObj ) {

        let loadObj = {};

        loadObj.model = {};

        //loadObj.model.crossOrigin = 'anonymous';
        // TODO: set headers and crossorigin here

        loadObj.callback = waitObj.callback;

        loadObj.prim = waitObj.attach; ///////////////////////////

        loadObj.busy = true;

		fetch( waitObj.source )
        	.then(response => response.text())
        	.then(xmlString => uploadModel( loadObj, waitObj.callback))
        	.then(data => console.log(data));

        // Start the loading.

        this.cacheCt++;

        return loadObj;

    }


}