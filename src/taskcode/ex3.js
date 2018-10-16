export default String.raw`#include<stdio.h>
int main()
{
    int i,j,n=3;
    int*ps[3];
    for(i=0; i<n; ++i){
        ps[i]=malloc(sizeof(int)*n);
        for(j=0; j<n; ++j){
            ps[i][j]=i*i + j*j;
        }
    }
    for(i=0; i<n; ++i){
        if(ps[i][2]%2==0)
            free(ps[i]);
    }
    return 0;
}`;