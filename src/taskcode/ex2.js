export default String.raw`#include<stdio.h>
int f(int* pn){
    int n = (*pn);
    int r = 1;
    if(1<=n){
        (*pn) = n - 1;
        r = n * f(pn);
    }
    return r;
}
int main()
{
    int n = 4;
    int r = f(&n);
    return 0;
}`;