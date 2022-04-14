class Util {
    static nameOfField(exp:Function):string {
        return exp.toString().match(/\=\>\s+[^\.]+\.(.+)/)?.[1];
    }
}