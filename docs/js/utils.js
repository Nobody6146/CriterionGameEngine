class Util {
    static nameOfField(exp) {
        return exp.toString().match(/\=\>\s+[^\.]+\.(.+)/)?.[1];
    }
}
