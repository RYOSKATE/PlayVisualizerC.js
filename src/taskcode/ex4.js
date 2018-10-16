export default String.raw`#include<stdio.h>
int H(int n,char a,char b,char c)
{
    if(n>=2){
        H(n-1,a,c,b);
    }

    if(n>=2){
        H(n-1,b,a,c);
    }
    return n;
}

int main()
{
    H(4,'A','B','C');
    return 0;
}`;