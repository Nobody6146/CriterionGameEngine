class MathUtil {
    static degreesToRadians(degrees:number): number
    {
        var pi = Math.PI;
        return degrees * (pi/180);
    }
    radiansToDegrees(radians:number): number
    {
        return radians / Math.PI * 180;
    }
}

class Vector2f {
    #array:Float32Array;

    constructor(array?:Float32Array | number[])
    {
        this.#array = new Float32Array(2);
        for(let i = 0; i < this.#array.length;i++)
            this.#array[i] = array?.[i] ?? 0;
    }

    get array() {
        return this.#array;
    }
    get x() {
        return this.#array[0];
    }
    set x(value:number) {
        this.#array[0] = value;
    }
    get y() {
        return this.#array[1];
    }
    set y(value:number) {
        this.#array[1] = value;
    }
    get width() {
        return this.#array[0];
    }
    set width(value:number) {
        this.#array[0] = value;
    }
    get height() {
        return this.#array[1];
    }
    set height(value:number) {
        this.#array[1] = value;
    }
    magnitudeSquared(): number {
        return this.x * this.x + this.y * this.y;
    }
    magnitude():number {
        return Math.sqrt(this.magnitudeSquared());
    }
    dot(vector: Vector2f): number {
        return this.x * vector.x + this.y * vector.y;
    }
    normalize(): Vector2f {
        let magnitude = this.magnitude();
        return this.divide(magnitude);
    }
    add(vector:Vector2f): Vector2f {
        return new Vector2f([this.x + vector.x, this.y + vector.y]);
    }
    subtract(vector:Vector2f): Vector2f {
        return new Vector2f([this.x - vector.x, this.y - vector.y]);
    }
    scale(scalar:number): Vector2f {
        return new Vector2f([this.x * scalar, this.y * scalar]);
    }
    divide(scalar:number): Vector2f{
        return this.scale(1 / scalar);
    }
    equals(vector:Vector2f):boolean {
        for(let i = 0; i < this.#array.length; i++)
            if(this.#array[i] !== vector.array[i])
                return false;
        return true;
    }
}

class Vector3f {
    #array:Float32Array;

    constructor(array?:Float32Array | number[])
    {
        this.#array = new Float32Array(3);
        for(let i = 0; i < this.#array.length;i++)
            this.#array[i] = array?.[i] ?? 0;
    }

    get array() {
        return this.#array;
    }
    get x() {
        return this.#array[0];
    }
    set x(value:number) {
        this.#array[0] = value;
    }
    get y() {
        return this.#array[1];
    }
    set y(value:number) {
        this.#array[1] = value;
    }
    get z() {
        return this.#array[2];
    }
    set z(value:number) {
        this.#array[2] = value;
    }
    magnitudeSquared(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    magnitude():number {
        return Math.sqrt(this.magnitudeSquared());
    }
    dot(vector: Vector3f): number {
        return this.x * vector.x + this.y * vector.y + this.z * vector.z;
    }
    normalize(): Vector3f {
        let magnitude = this.magnitude();
        return this.divide(magnitude);
    }
    add(vector:Vector3f): Vector3f {
        return new Vector3f([this.x + vector.x, this.y + vector.y, this.z + vector.z]);
    }
    subtract(vector:Vector3f): Vector3f {
        return new Vector3f([this.x - vector.x, this.y - vector.y, this.z - vector.z]);
    }
    scale(scalar:number): Vector3f {
        return new Vector3f([this.x * scalar, this.y * scalar, this.z * scalar]);
    }
    divide(scalar:number): Vector3f {
        return this.scale(1 / scalar);
    }
    transform(transformation:Matrix4f): Vector3f {
        return new Vector3f(transformation.multiplyVector(new Vector4f([...this.array, 1])).array);
    }
    equals(vector:Vector3f):boolean {
        for(let i = 0; i < this.#array.length; i++)
            if(this.#array[i] !== vector.array[i])
                return false;
        return true;
    }
}

//Vector4f==================
class Vector4f {
    #array:Float32Array;

    constructor(array?:Float32Array | number[])
    {
        this.#array = new Float32Array(4);
        for(let i = 0; i < this.#array.length;i++)
            this.#array[i] = array?.[i] ?? 0;
    }

    get array() {
        return this.#array;
    }
    get x() {
        return this.#array[0];
    }
    set x(value:number) {
        this.#array[0] = value;
    }
    get y() {
        return this.#array[1];
    }
    set y(value:number) {
        this.#array[1] = value;
    }
    get z() {
        return this.#array[2];
    }
    set z(value:number) {
        this.#array[2] = value;
    }
    get w() {
        return this.#array[3];
    }
    set w(value:number) {
        this.#array[3] = value;
    }  
    get width() {
        return this.#array[2];
    }
    set width(value:number) {
        this.#array[2] = value;
    }
    get height() {
        return this.#array[3];
    }
    set height(value:number) {
        this.#array[3] = value;
    }
    get r() {
        return this.#array[0];
    }
    set r(value:number) {
        this.#array[0] = value;
    }
    get g() {
        return this.#array[1];
    }
    set g(value:number) {
        this.#array[1] = value;
    }
    get b() {
        return this.#array[2];
    }
    set b(value:number) {
        this.#array[2] = value;
    }
    get a() {
        return this.#array[3];
    }
    set a(value:number) {
        this.#array[3] = value;
    }
    magnitudeSquared(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }
    magnitude():number {
        return Math.sqrt(this.magnitudeSquared());
    }
    dot(vector: Vector4f): number {
        return this.x * vector.x + this.y * vector.y + this.z * vector.z + this.w * vector.w;
    }
    normalize(): Vector4f {
        let magnitude = this.magnitude();
        return this.divide(magnitude);
    }
    add(vector:Vector4f): Vector4f {
        return new Vector4f([this.x + vector.x, this.y + vector.y, this.z + vector.z, this.w + vector.w]);
    }
    subtract(vector:Vector4f): Vector4f {
        return new Vector4f([this.x - vector.x, this.y - vector.y, this.z - vector.z, this.w - vector.w]);
    }
    scale(scalar:number): Vector4f {
        return new Vector4f([this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar]);
    }
    divide(scalar:number): Vector4f {
        return this.scale(1 / scalar);
    }
    equals(vector:Vector4f):boolean {
        return this.x == vector.x && this.y == vector.y && this.z == vector.z && this.w == vector.w;
    }
    contains(position:Vector2f | Vector3f):boolean {
        return position.x >= this.x && position.x <= this.x + this.width
            && position.y >= this.y && position.y <= this.y + this.height;
    }
}

//Matrix3f====================
class Matrix3f {
    #array:Float32Array;

    constructor(array?:Float32Array | number[])
    {
        this.#array = new Float32Array(3*3);
        for(let i = 0; i < this.#array.length;i++)
            this.#array[i] = array?.[i] ?? 0;
    }

    get array() {
        return this.#array;
    }

    get m00() {
        return this.#array[0];
    }
    set m00(value:number) {
        this.#array[0] = value;
    }
    get m10() {
        return this.#array[1];
    }
    set m10(value:number) {
        this.#array[1] = value;
    }
    get m20() {
        return this.#array[2];
    }
    set m20(value:number) {
        this.#array[2] = value;
    }

    get m01() {
        return this.#array[3];
    }
    set m01(value:number) {
        this.#array[3] = value;
    }
    get m11() {
        return this.#array[4];
    }
    set m11(value:number) {
        this.#array[4] = value;
    }
    get m21() {
        return this.#array[5];
    }
    set m21(value:number) {
        this.#array[5] = value;
    }
 
    get m02() {
        return this.#array[6];
    }
    set m02(value:number) {
        this.#array[6] = value;
    }
    get m12() {
        return this.#array[7];
    }
    set m12(value:number) {
        this.#array[7] = value;
    }
    get m22() {
        return this.#array[8];
    }
    set m22(value:number) {
        this.#array[8] = value;
    }

    static identity(): Matrix3f {
        let identity = new Matrix3f();
        identity.m00 = 1;
        identity.m11 = 1;
        identity.m22 = 1;
        return identity;
    }
    add(matrix: Matrix3f) :Matrix3f {
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
    subtract(matrix: Matrix3f): Matrix3f {
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
    multiplyScalar(scalar:number): Matrix3f {
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
    multiplyVector(vector: Vector3f): Vector3f {
        let x = this.m00 * vector.x + this.m01 * vector.y + this.m02 * vector.z;
        let y = this.m10 * vector.x + this.m11 * vector.y + this.m12 * vector.z;
        let z = this.m20 * vector.x + this.m21 * vector.y + this.m22 * vector.z;
        return new Vector3f([x, y, z]);
    }
    multiply(matrix:Matrix3f): Matrix3f {
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
    transpose(): Matrix3f {
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
}


class Matrix4f {
    #array:Float32Array;

    constructor(array?:Float32Array | number[])
    {
        this.#array = new Float32Array(4*4);
        for(let i = 0; i < this.#array.length;i++)
            this.#array[i] = array?.[i] ?? 0;
    }

    get array() {
        return this.#array;
    }

    get m00() {
        return this.#array[0];
    }
    set m00(value:number) {
        this.#array[0] = value;
    }
    get m10() {
        return this.#array[1];
    }
    set m10(value:number) {
        this.#array[1] = value;
    }
    get m20() {
        return this.#array[2];
    }
    set m20(value:number) {
        this.#array[2] = value;
    }
    get m30() {
        return this.#array[3];
    }
    set m30(value:number) {
        this.#array[3] = value;
    }

    get m01() {
        return this.#array[4];
    }
    set m01(value:number) {
        this.#array[4] = value;
    }
    get m11() {
        return this.#array[5];
    }
    set m11(value:number) {
        this.#array[5] = value;
    }
    get m21() {
        return this.#array[6];
    }
    set m21(value:number) {
        this.#array[6] = value;
    }
    get m31() {
        return this.#array[7];
    }
    set m31(value:number) {
        this.#array[7] = value;
    }

    get m02() {
        return this.#array[8];
    }
    set m02(value:number) {
        this.#array[8] = value;
    }
    get m12() {
        return this.#array[9];
    }
    set m12(value:number) {
        this.#array[9] = value;
    }
    get m22() {
        return this.#array[10];
    }
    set m22(value:number) {
        this.#array[10] = value;
    }
    get m32() {
        return this.#array[11];
    }
    set m32(value:number) {
        this.#array[11] = value;
    }

    get m03() {
        return this.#array[12];
    }
    set m03(value:number) {
        this.#array[12] = value;
    }
    get m13() {
        return this.#array[13];
    }
    set m13(value:number) {
        this.#array[13] = value;
    }
    get m23() {
        return this.#array[14];
    }
    set m23(value:number) {
        this.#array[14] = value;
    }
    get m33() {
        return this.#array[15];
    }
    set m33(value:number) {
        this.#array[15] = value;
    }

    static identity(): Matrix4f {
        let identity = new Matrix4f();
        identity.m00 = 1;
        identity.m11 = 1;
        identity.m22 = 1;
        identity.m33 = 1;
        return identity;
    }
    add(matrix:Matrix4f):Matrix4f {
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
    subtract(matrix:Matrix4f): Matrix4f {
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
    multiplyScalar(scalar:number):Matrix4f {
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
    multiplyVector(vector:Vector4f):Vector4f {
        let x = this.m00 * vector.x + this.m01 * vector.y + this.m02 * vector.z + this.m03 * vector.w;
        let y = this.m10 * vector.x + this.m11 * vector.y + this.m12 * vector.z + this.m13 * vector.w;
        let z = this.m20 * vector.x + this.m21 * vector.y + this.m22 * vector.z + this.m23 * vector.w;
        let w = this.m30 * vector.x + this.m31 * vector.y + this.m32 * vector.z + this.m33 * vector.w;
        return new Vector4f([x, y, z, w]);
    }
    multiply(matrix:Matrix4f):Matrix4f {
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
    transpose(): Matrix4f {
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
    static translation(x:number, y:number, z:number): Matrix4f {
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
    static rotation(angle:number, x:number, y:number, z:number): Matrix4f {
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
    static scaled(x:number, y:number, z:number): Matrix4f{
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
    static transformation(position:Vector3f, rotation:Vector3f, scale:Vector3f):Matrix4f {
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
     static orthographic(left:number, right:number, bottom:number, top:number, near:number, far:number): Matrix4f {
        let ortho = Matrix4f.identity();
    
        let tx = -(right + left) / (right - left);
        let ty = -(top + bottom) / (top - bottom);
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
    static frustum(left:number, right:number, bottom:number, top:number, near:number, far:number):Matrix4f {
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
    static perspective(fovy:number, aspect:number, near:number, far:number): Matrix4f {
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

    static viewMatrix(position:Vector3f, rotation:Vector3f) {
        let viewMatrix = Matrix4f.identity();
        viewMatrix = viewMatrix.multiply(Matrix4f.rotation(rotation.x, 1, 0, 0));
        viewMatrix = viewMatrix.multiply(Matrix4f.rotation(rotation.y, 0, 1, 0));
        viewMatrix = viewMatrix.multiply(Matrix4f.translation(-position.x, -position.y, -position.z));
        return viewMatrix;
    }
}