export default String.raw`void swap1(int* x, int* y){
    int s = *x;
    if(s<2){
        *x = *y;
        *y = s;
    }
}
void swap2(int *z, int *w){
    int t = *z;
    if(t<3){
        *z = *w;
        *w = t;
    }
}
void swap3(int *w, int *o){
    int u = *w;
    if(u<4){
        *w = *o;
        *o = u;
    }else{
        *o = 6;
        swap1(o,w);
    }
}
int main()
{
    int a = 1, b = 2, c = 3, d = 4, e = 5;
    swap1(&a,&b);
    swap3(&a,&c);
    swap2(&e,&b);
    swap3(&d,&e);
    swap2(&b,&c);
    swap1(&a,&d);
    return 0;
}`;