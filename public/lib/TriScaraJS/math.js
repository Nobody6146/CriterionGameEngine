function MathUtil() {

}
MathUtil.degreesToRadians = function(degrees)
{
    var pi = Math.PI;
    return degrees * (pi/180);
}
MathUtil.radiansToDegrees = function(radians)
{
    return radians / Math.PI * 180;
}

function Vector2f(array) {
    if(Array.isArray(array))
    {
        this.array = [];
        for(let i = 0; i < 2; i++)
            this.array[i] = array[i];
    }
    else
        this.array = [0,0];

    let vec = this;
    let addProp = function(name, index) {
        Object.defineProperty(vec, name, {
            get() {
                return vec.array[index];
            },
            set(value) {
                vec.array[index] = value;
            }
        });
    }
    addProp("x", 0);
    addProp("y", 1);
    addProp("u", 0);
    addProp("v", 1);
}
Vector2f.prototype.toBuffer = function() {
    return new Float32Array(this.array);
}
Vector2f.prototype.magnitudeSquared = function() {
    return this.x * this.x + this.y * this.y;
}
Vector2f.prototype.magnitude = function() {
    return Math.sqrt(this.magnitudeSquared());
}
Vector2f.prototype.normalize = function() {
    let magnitude = this.magnitude();
    return this.divide(magnitude);
}
Vector2f.prototype.add = function(vector) {
    return new Vector2f([this.x + vector.x, this.y + vector.y]);
}
Vector2f.prototype.subtract = function(vector) {
    return new Vector2f([this.x - vector.x, this.y - vector.y]);
}
Vector2f.prototype.scale = function(scalar) {
    return new Vector2f([this.x*scalar, this.y*scalar]);
}
Vector2f.prototype.divide = function(scalar) {
    return this.scale(1 / scalar);
}
Vector2f.prototype.dot = function(vector) {
    return this.x * vector.x + this.y * vector.y;
}


//=======================================
function Vector3f(array) {
    if(Array.isArray(array))
    {
        this.array = [];
        for(let i = 0; i < 3; i++)
            this.array[i] = array[i];
    }
    else
        this.array = [0,0,0];

    let vec = this;
    let addProp = function(name, index) {
        Object.defineProperty(vec, name, {
            get() {
                return vec.array[index];
            },
            set(value) {
                vec.array[index] = value;
            }
        });
    }
    addProp("x", 0);
    addProp("y", 1);
    addProp("z", 2);
}
Vector3f.prototype.toBuffer = function() {
    return new Float32Array(this.array);
}
Vector3f.prototype.magnitudeSquared = function() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
}
Vector3f.prototype.magnitude = function() {
    return Math.sqrt(this.magnitudeSquared());
}
Vector3f.prototype.normalize = function() {
    let magnitude = this.magnitude();
    return this.divide(magnitude);
}
Vector3f.prototype.add = function(vector) {
    return new Vector3f([this.x + vector.x, this.y + vector.y, this.z + vector.z]);
}
Vector3f.prototype.subtract = function(vector) {
    return new Vector3f([this.x - vector.x, this.y - vector.y, this.z - vector.z]);
}
Vector3f.prototype.scale = function(scalar) {
    return new Vector3f([this.x*scalar, this.y*scalar, this.z*scalar]);
}
Vector3f.prototype.divide = function(scalar) {
    return this.scale(1 / scalar);
}
Vector3f.prototype.dot = function(vector) {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z;
}

//Vector4f==================
function Vector4f(array) {
    if(Array.isArray(array))
    {
        this.array = [];
        for(let i = 0; i < 4; i++)
            this.array[i] = array[i];
    }
    else
        this.array = [0,0,0,0];

    let vec = this;
    let addProp = function(name, index) {
        Object.defineProperty(vec, name, {
            get() {
                return vec.array[index];
            },
            set(value) {
                vec.array[index] = value;
            }
        });
    }
    addProp("x", 0);
    addProp("y", 1);
    addProp("z", 2);
    addProp("w", 3);
    addProp("r", 0);
    addProp("g", 1);
    addProp("b", 2);
    addProp("a", 3);
}
Vector4f.prototype.toBuffer = function() {
    return new Float32Array(this.array);
}
Vector4f.prototype.magnitudeSquared = function() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
}
Vector4f.prototype.magnitude = function() {
    return Math.sqrt(this.magnitudeSquared());
}
Vector4f.prototype.normalize = function() {
    let magnitude = this.magnitude();
    return this.divide(magnitude);
}
Vector4f.prototype.add = function(vector) {
    return new Vector4f([this.x + vector.x, this.y + vector.y, this.z + vector.z, this.w + vector.w]);
}
Vector4f.prototype.subtract = function(vector) {
    return new Vector4f([this.x - vector.x, this.y - vector.y, this.z - vector.z, this.w - vector.w]);
}
Vector4f.prototype.scale = function(scalar) {
    return new Vector4f([this.x*scalar, this.y*scalar, this.z*scalar, this.w*scalar]);
}
Vector4f.prototype.divide = function(scalar) {
    return this.scale(1 / scalar);
}
Vector4f.prototype.dot = function(vector) {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z + this.w * vector.w;
}

//Matrix3f====================
function Matrix3f(array) {
    if(Array.isArray(array))
    {
        this.array = [];
        for(let i = 0; i < 9; i++)
            this.array[i] = array[i];
    }
    else
        this.array = [0,0,0,0,0,0,0,0,0];

    let vec = this;
    let addProp = function(name, index) {
        Object.defineProperty(vec, name, {
            get() {
                return vec.array[index];
            },
            set(value) {
                vec.array[index] = value;
            }
        });
    }
    addProp("m00", 0);
    addProp("m10", 1);
    addProp("m20", 2);
    addProp("m01", 3);
    addProp("m11", 4);
    addProp("m21", 5);
    addProp("m02", 6);
    addProp("m12", 7);
    addProp("m22", 8);
}
Matrix3f.prototype.toBuffer = function() {
    return new Float32Array(this.array);
}
Matrix3f.identity = function() {
    let identity = new Matrix3f();
    identity.m00 = 1;
    identity.m11 = 1;
    identity.m22 = 1;
    return identity;
}
Matrix3f.prototype.add = function(matrix) {
    let result = new Matrix3f();
    result.m00 = this.m00 + matrix.m00;
    result.m10 = this.m10 + matrix.m10;
    result.m20 = this.m20 + matrix.m20;

    result.m01 = this.m01 + matrix.m01;
    result.m11 = this.m11 + matrix.m11;
    result.m21 = this.m21 + matrix.m21;

    result.m02 = this.m02 + matrix.m02;
    result.m12 = this.m12 + matrix.m12;
    result.m22 = this.m22 + matrix.m22;
    return result;
}
Matrix3f.prototype.add = function(matrix) {
    let result = new Matrix3f();
    result.m00 = this.m00 - matrix.m00;
    result.m10 = this.m10 - matrix.m10;
    result.m20 = this.m20 - matrix.m20;

    result.m01 = this.m01 - matrix.m01;
    result.m11 = this.m11 - matrix.m11;
    result.m21 = this.m21 - matrix.m21;

    result.m02 = this.m02 - matrix.m02;
    result.m12 = this.m12 - matrix.m12;
    result.m22 = this.m22 - matrix.m22;
    return result;
}
Matrix3f.prototype.multiplyScalar = function(scalar) {
    let result = new Matrix3f();
    result.m00 = this.m00 * scalar;
    result.m10 = this.m10 * scalar;
    result.m20 = this.m20 * scalar;

    result.m01 = this.m01 * scalar;
    result.m11 = this.m11 * scalar;
    result.m21 = this.m21 * scalar;

    result.m02 = this.m02 * scalar;
    result.m12 = this.m12 * scalar;
    result.m22 = this.m22 * scalar;

    return result;
}
Vector3f.multiplyVector = function(vector) {
    let x = this.m00 * vector.x + this.m01 * vector.y + this.m02 * vector.z;
    let y = this.m10 * vector.x + this.m11 * vector.y + this.m12 * vector.z;
    let z = this.m20 * vector.x + this.m21 * vector.y + this.m22 * vector.z;
    return new Vector3f([x, y, z]);
}
Matrix3f.prototype.multiply = function(matrix) {
    let result = new Matrix3f();
    result.m00 = this.m00 * matrix.m00 + this.m01 * matrix.m10 + this.m02 * matrix.m20;
    result.m10 = this.m10 * matrix.m00 + this.m11 * matrix.m10 + this.m12 * matrix.m20;
    result.m20 = this.m20 * matrix.m00 + this.m21 * matrix.m10 + this.m22 * matrix.m20;

    result.m01 = this.m00 * matrix.m01 + this.m01 * matrix.m11 + this.m02 * matrix.m21;
    result.m11 = this.m10 * matrix.m01 + this.m11 * matrix.m11 + this.m12 * matrix.m21;
    result.m21 = this.m20 * matrix.m01 + this.m21 * matrix.m11 + this.m22 * matrix.m21;

    result.m02 = this.m00 * matrix.m02 + this.m01 * matrix.m12 + this.m02 * matrix.m22;
    result.m12 = this.m10 * matrix.m02 + this.m11 * matrix.m12 + this.m12 * matrix.m22;
    result.m22 = this.m20 * matrix.m02 + this.m21 * matrix.m12 + this.m22 * matrix.m22;

    return result;
}
Matrix3f.prototype.transpose = function() {
    let result = new Matrix3f();
    result.m00 = this.m00;
    result.m10 = this.m01;
    result.m20 = this.m02;

    result.m01 = this.m10;
    result.m11 = this.m11;
    result.m21 = this.m12;

    result.m02 = this.m20;
    result.m12 = this.m21;
    result.m22 = this.m22;

    return result;
}


//Matrix4f====================
function Matrix4f(array) {
    if(Array.isArray(array))
    {
        this.array = [];
        for(let i = 0; i < 16; i++)
            this.array[i] = array[i];
    }
    else
        this.array = [0,0,0,0, 0,0,0,0 ,0,0,0,0 ,0,0,0,0];

    let vec = this;
    let addProp = function(name, index) {
        Object.defineProperty(vec, name, {
            get() {
                return vec.array[index];
            },
            set(value) {
                vec.array[index] = value;
            }
        });
    }
    addProp("m00", 0);
    addProp("m10", 1);
    addProp("m20", 2);
    addProp("m30", 3);
    addProp("m01", 4);
    addProp("m11", 5);
    addProp("m21", 6);
    addProp("m31", 7);
    addProp("m02", 8);
    addProp("m12", 9);
    addProp("m22", 10);
    addProp("m32", 11);
    addProp("m03", 12);
    addProp("m13", 13);
    addProp("m23", 14);
    addProp("m33", 15);
}
Matrix4f.prototype.toBuffer = function() {
    return new Float32Array(this.array);
}
Matrix4f.identity = function() {
    let identity = new Matrix4f();
    identity.m00 = 1;
    identity.m11 = 1;
    identity.m22 = 1;
    identity.m33 = 1;
    return identity;
}
Matrix4f.prototype.add = function(matrix) {
    let result = new Matrix4f();

    result.m00 = this.m00 + matrix.m00;
    result.m10 = this.m10 + matrix.m10;
    result.m20 = this.m20 + matrix.m20;
    result.m30 = this.m30 + matrix.m30;

    result.m01 = this.m01 + matrix.m01;
    result.m11 = this.m11 + matrix.m11;
    result.m21 = this.m21 + matrix.m21;
    result.m31 = this.m31 + matrix.m31;

    result.m02 = this.m02 + matrix.m02;
    result.m12 = this.m12 + matrix.m12;
    result.m22 = this.m22 + matrix.m22;
    result.m32 = this.m32 + matrix.m32;

    result.m03 = this.m03 + matrix.m03;
    result.m13 = this.m13 + matrix.m13;
    result.m23 = this.m23 + matrix.m23;
    result.m33 = this.m33 + matrix.m33;

    return result;
}
Matrix4f.prototype.subtract = function(matrix) {
    let result = new Matrix4f();

    result.m00 = this.m00 - matrix.m00;
    result.m10 = this.m10 - matrix.m10;
    result.m20 = this.m20 - matrix.m20;
    result.m30 = this.m30 - matrix.m30;

    result.m01 = this.m01 - matrix.m01;
    result.m11 = this.m11 - matrix.m11;
    result.m21 = this.m21 - matrix.m21;
    result.m31 = this.m31 - matrix.m31;

    result.m02 = this.m02 - matrix.m02;
    result.m12 = this.m12 - matrix.m12;
    result.m22 = this.m22 - matrix.m22;
    result.m32 = this.m32 - matrix.m32;

    result.m03 = this.m03 - matrix.m03;
    result.m13 = this.m13 - matrix.m13;
    result.m23 = this.m23 - matrix.m23;
    result.m33 = this.m33 - matrix.m33;

    return result;
}
Matrix4f.prototype.multiplyScalar = function(scalar) {
    let result = new Matrix4f();
    result.m00 = this.m00 * scalar;
    result.m10 = this.m10 * scalar;
    result.m20 = this.m20 * scalar;
    result.m30 = this.m30 * scalar;

    result.m01 = this.m01 * scalar;
    result.m11 = this.m11 * scalar;
    result.m21 = this.m21 * scalar;
    result.m31 = this.m31 * scalar;

    result.m02 = this.m02 * scalar;
    result.m12 = this.m12 * scalar;
    result.m22 = this.m22 * scalar;
    result.m32 = this.m32 * scalar;

    result.m03 = this.m03 * scalar;
    result.m13 = this.m13 * scalar;
    result.m23 = this.m23 * scalar;
    result.m33 = this.m33 * scalar;

    return result;
}
Matrix4f.prototype.multiplyVector = function(vector) {
    let x = this.m00 * vector.x + this.m01 * vector.y + this.m02 * vector.z + this.m03 * vector.w;
    let y = this.m10 * vector.x + this.m11 * vector.y + this.m12 * vector.z + this.m13 * vector.w;
    let z = this.m20 * vector.x + this.m21 * vector.y + this.m22 * vector.z + this.m23 * vector.w;
    let w = this.m30 * vector.x + this.m31 * vector.y + this.m32 * vector.z + this.m33 * vector.w;
    return new Vector4f([x, y, z, w]);
}
Matrix4f.prototype.multiply = function(matrix) {
    let result = new Matrix4f();
    result.m00 = this.m00 * matrix.m00 + this.m01 * matrix.m10 + this.m02 * matrix.m20 + this.m03 * matrix.m30;
    result.m10 = this.m10 * matrix.m00 + this.m11 * matrix.m10 + this.m12 * matrix.m20 + this.m13 * matrix.m30;
    result.m20 = this.m20 * matrix.m00 + this.m21 * matrix.m10 + this.m22 * matrix.m20 + this.m23 * matrix.m30;
    result.m30 = this.m30 * matrix.m00 + this.m31 * matrix.m10 + this.m32 * matrix.m20 + this.m33 * matrix.m30;

    result.m01 = this.m00 * matrix.m01 + this.m01 * matrix.m11 + this.m02 * matrix.m21 + this.m03 * matrix.m31;
    result.m11 = this.m10 * matrix.m01 + this.m11 * matrix.m11 + this.m12 * matrix.m21 + this.m13 * matrix.m31;
    result.m21 = this.m20 * matrix.m01 + this.m21 * matrix.m11 + this.m22 * matrix.m21 + this.m23 * matrix.m31;
    result.m31 = this.m30 * matrix.m01 + this.m31 * matrix.m11 + this.m32 * matrix.m21 + this.m33 * matrix.m31;

    result.m02 = this.m00 * matrix.m02 + this.m01 * matrix.m12 + this.m02 * matrix.m22 + this.m03 * matrix.m32;
    result.m12 = this.m10 * matrix.m02 + this.m11 * matrix.m12 + this.m12 * matrix.m22 + this.m13 * matrix.m32;
    result.m22 = this.m20 * matrix.m02 + this.m21 * matrix.m12 + this.m22 * matrix.m22 + this.m23 * matrix.m32;
    result.m32 = this.m30 * matrix.m02 + this.m31 * matrix.m12 + this.m32 * matrix.m22 + this.m33 * matrix.m32;

    result.m03 = this.m00 * matrix.m03 + this.m01 * matrix.m13 + this.m02 * matrix.m23 + this.m03 * matrix.m33;
    result.m13 = this.m10 * matrix.m03 + this.m11 * matrix.m13 + this.m12 * matrix.m23 + this.m13 * matrix.m33;
    result.m23 = this.m20 * matrix.m03 + this.m21 * matrix.m13 + this.m22 * matrix.m23 + this.m23 * matrix.m33;
    result.m33 = this.m30 * matrix.m03 + this.m31 * matrix.m13 + this.m32 * matrix.m23 + this.m33 * matrix.m33;

    return result;
}
Matrix4f.prototype.transpose = function() {
    let result = new Matrix4f();

    result.m00 = this.m00;
    result.m10 = this.m01;
    result.m20 = this.m02;
    result.m30 = this.m03;

    result.m01 = this.m10;
    result.m11 = this.m11;
    result.m21 = this.m12;
    result.m31 = this.m13;

    result.m02 = this.m20;
    result.m12 = this.m21;
    result.m22 = this.m22;
    result.m32 = this.m23;

    result.m03 = this.m30;
    result.m13 = this.m31;
    result.m23 = this.m32;
    result.m33 = this.m33;

    return result;
}
/**
 * Creates a translation matrix. Similar to
 * <code>glTranslate(x, y, z)</code>.
 *
 * @param x x coordinate of translation vector
 * @param y y coordinate of translation vector
 * @param z z coordinate of translation vector
 *
 * @return Translation matrix
 */
Matrix4f.translation = function(x, y, z) {
    let translation = Matrix4f.identity();

    translation.m03 = x;
    translation.m13 = y;
    translation.m23 = z;

    return translation;
}
/**
 * Creates a rotation matrix. Similar to
 * <code>glRotate(angle, x, y, z)</code>.
 *
 * @param angle Angle of rotation in degrees
 * @param x     x coordinate of the rotation vector
 * @param y     y coordinate of the rotation vector
 * @param z     z coordinate of the rotation vector
 *
 * @return Rotation matrix
 */
Matrix4f.rotation = function(angle, x, y, z) {
    let rotation = Matrix4f.identity();

    let c = Math.cos(MathUtil.degreesToRadians(angle));
    let s = Math.sin(MathUtil.degreesToRadians(angle));
    let vec = new Vector3f([x, y, z]);
    if (vec.magnitude() != 1) {
        vec = vec.normalize();
        x = vec.x;
        y = vec.y;
        z = vec.z;
    }

    rotation.m00 = x * x * (1 - c) + c;
    rotation.m10 = y * x * (1 - c) + z * s;
    rotation.m20 = x * z * (1 - c) - y * s;
    rotation.m01 = x * y * (1 - c) - z * s;
    rotation.m11 = y * y * (1 - c) + c;
    rotation.m21 = y * z * (1 - c) + x * s;
    rotation.m02 = x * z * (1 - c) + y * s;
    rotation.m12 = y * z * (1 - c) - x * s;
    rotation.m22 = z * z * (1 - c) + c;

    return rotation;
}
/**
 * Creates a scaling matrix. Similar to <code>glScale(x, y, z)</code>.
 *
 * @param x Scale factor along the x coordinate
 * @param y Scale factor along the y coordinate
 * @param z Scale factor along the z coordinate
 *
 * @return Scaling matrix
 */
Matrix4f.scaled = function(x, y, z) {
    let scaling = Matrix4f.identity();

    scaling.m00 = x;
    scaling.m11 = y;
    scaling.m22 = z;

    return scaling;
}
/**
 * Creates a transformation matrix..
 *
 * @param postion Vector representing coordinate location
 * @param rotation Vector representing rotation across all axi
 * @param scale Vector representing scaling across all axi
 *
 * @return Transformation matrix
 */
Matrix4f.transformation = function(position, rotation, scale) {
    let transformationMatrix = Matrix4f.identity();
    transformationMatrix = transformationMatrix.multiply(Matrix4f.translation(position.x, position.y, position.z));
    transformationMatrix = transformationMatrix.multiply(Matrix4f.rotation(rotation.x, 1, 0, 0));
    transformationMatrix = transformationMatrix.multiply(Matrix4f.rotation(rotation.y, 0, 1, 0));
    transformationMatrix = transformationMatrix.multiply(Matrix4f.rotation(rotation.z, 0, 0, 1));
    transformationMatrix = transformationMatrix.multiply(Matrix4f.scaled(scale.x, scale.y, scale.z));
    return transformationMatrix;
}
/**
 * Creates a orthographic projection matrix. Similar to
 * <code>glOrtho(left, right, bottom, top, near, far)</code>.
 *
 * @param left   Coordinate for the left vertical clipping pane
 * @param right  Coordinate for the right vertical clipping pane
 * @param bottom Coordinate for the bottom horizontal clipping pane
 * @param top    Coordinate for the bottom horizontal clipping pane
 * @param near   Coordinate for the near depth clipping pane
 * @param far    Coordinate for the far depth clipping pane
 *
 * @return Orthographic matrix
 */
 Matrix4f.orthographic = function(left, right, bottom, top, near, far) {
    let ortho = Matrix4f.identity();

    let tx = -(right + left) / (right - left);
    let ty = -(top + bottom) / (bottom - top);
    let tz = -(far + near) / (far - near);

    ortho.m00 = 2 / (right - left);
    ortho.m11 = 2 / (top - bottom);
    ortho.m22 = -2 / (far - near);
    ortho.m03 = tx;
    ortho.m13 = ty;
    ortho.m23 = tz;

    return ortho;
}
/**
 * Creates a perspective projection matrix. Similar to
 * <code>glFrustum(left, right, bottom, top, near, far)</code>.
 *
 * @param left   Coordinate for the left vertical clipping pane
 * @param right  Coordinate for the right vertical clipping pane
 * @param bottom Coordinate for the bottom horizontal clipping pane
 * @param top    Coordinate for the bottom horizontal clipping pane
 * @param near   Coordinate for the near depth clipping pane, must be
 *               positive
 * @param far    Coordinate for the far depth clipping pane, must be
 *               positive
 *
 * @return Perspective matrix
 */
Matrix4f.frustum = function(left, right, bottom, top, near, far) {
    let frustum = Matrix4f.identity();

    let a = (right + left) / (right - left);
    let b = (top + bottom) / (top - bottom);
    let c = -(far + near) / (far - near);
    let d = -(2 * far * near) / (far - near);

    frustum.m00 = (2 * near) / (right - left);
    frustum.m11 = (2 * near) / (top - bottom);
    frustum.m02 = a;
    frustum.m12 = b;
    frustum.m22 = c;
    frustum.m32 = -1;
    frustum.m23 = d;
    frustum.m33 = 0;

    return frustum;
}
/**
 * Creates a perspective projection matrix. Similar to
 * <code>gluPerspective(fovy, aspec, zNear, zFar)</code>.
 *
 * @param fovy   Field of view angle in degrees
 * @param aspect The aspect ratio is the ratio of width to height
 * @param near   Distance from the viewer to the near clipping plane, must
 *               be positive
 * @param far    Distance from the viewer to the far clipping plane, must be
 *               positive
 *
 * @return Perspective matrix
 */
Matrix4f.perspective = function(fovy, aspect, near, far) {
    let perspective = Matrix4f.identity();

    let f = 1 / Math.tan(MathUtil.degreesToRadians(fovy) / 2);

    perspective.m00 = f / aspect;
    perspective.m11 = f;
    perspective.m22 = (far + near) / (near - far);
    perspective.m32 = -1;
    perspective.m23 = (2 * far * near) / (near - far);
    perspective.m33 = 0;

    return perspective;
}