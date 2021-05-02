#include <iostream>
#include <string>
using namespace std;

int foo(int n) {
    if (n == 0) return 0;
    else return n + foo(n-1);
}

int main()
{
    cout << foo(4) << endl;
    return 0;
}
