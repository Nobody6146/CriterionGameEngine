function TModelLoader()
{

};
TModelLoader.loadObj = async function(url) {

    const text = await (await fetch(url)).text();

    return new Promise( (resolve, reject) => {

        let vertices = [];
        let uvCoordinates = [];
        let normals = [];

        let minVertex = null;
        let maxVertex = null;

        let faces = [];
        let indices = new Map();

        const keywordRegex = /(\w*)(?: )*(.*)/;
        const lines = text.split('\n');
        for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
            const line = lines[lineNumber].trim();
            //Skip empty lines or comments
            if (line === '' || line.startsWith('#'))
                continue
            const match = line.match(keywordRegex);
            if (!match)
                continue;
            
            const [, keyword, args] = match;
            const parts = args.split(/\s+/);
            //Load the raw data
            switch(keyword)
            {
                case 'v':
                    {
                        const vertex = [parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2])];
                        vertices.push(vertex);
                        if(minVertex == null)
                        {
                            minVertex = vertex.concat();
                            maxVertex = vertex.concat();
                        } else
                        {
                            for(let i = 0; i < vertex.length; i++)
                            {
                                if(vertex[i] < minVertex[i])
                                    minVertex[i] = vertex[i];
                                if(vertex[i] > maxVertex[i])
                                    maxVertex[i] = vertex[i];
                            }
                        }
                    }
                    
                    break;
                case 'vt':
                    uvCoordinates.push([parseFloat(parts[0]), 1 - parseFloat(parts[1])]);
                    break;
                case 'vn':
                    normals.push([parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2])]);
                    break;
                case "f":
                    parts.forEach(part => {
                        const data = part.split("/");
                        faces.push([parseInt(data[0]) - 1, parseInt(data[1]) - 1, parseInt(data[2]) - 1]);
                    });
                    break;
            }
        }

        let modelData = {
            indices: [],
            vertices: [],
            uvCoordinates: [],
            normals: [],
            minVertex,
            maxVertex
        }
        let vertexCounter = 0;

        //Process faces and organize data to optimize for OpenGL
        let loader = {
            indices,
            vertices,
            uvCoordinates,
            normals
        };

        //Calculate offset so we can center the model
        let offset = [];
        for(let i = 0; i < maxVertex.length; i++)
            offset[i] = minVertex[i] + Math.abs(maxVertex[i] - minVertex[i])/2
        
        faces.forEach(data => {
            let vertex = {
                index: data[0],
            }
                
            let uv = {
                index: data[1] !== NaN ? data[1] : -1
            }
            let normal = {
                index: data[2] !== NaN ? data[2] : -1
            };

            //Load the data needed for this point of the face
            vertex.data = loader.vertices[vertex.index].concat();
            //Apply offset to vertex to center theh model at the origin
            for(let i = 0; i < vertex.data.length; i++)
                vertex.data[i] -= offset[i];

            uv.data = loader.uvCoordinates[uv.index];
            normal.data = loader.normals[normal.index];

            //See if we've cached this combination of vertex data
            const key = vertex.index + ":" + uv.index + ":" + normal.index;
            let index = indices.get(key);

            //If it has not be cached, chache it and store an new OpenGL vertex pair
            if(index === undefined)
            {
                index = vertexCounter++;
                indices.set(key, index);
                modelData.vertices.push(... vertex.data);
                if(uv.data !== undefined)
                    modelData.uvCoordinates.push(... uv.data);
                if(normal.data !== undefined)
                    modelData.normals.push(... normal.data);
            }

            //Add the index
            modelData.indices.push(index);
        });

        resolve(modelData);
    });
}

//===================
function TTextureLoader() {
}
TTextureLoader.loadTexture = function(url) {

    return new Promise( (resolve, reject) => {
        const image = new Image();
        image.onload = function() {
            resolve(image);
        }
        image.onerror = function() {
            reject("Failed to load texture");
        }
        image.src = url;
    });
}