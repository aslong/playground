#include <iostream>
#include "hello.h"

int main (int argv, char *args[])
{
    Hello::Hello *hello = new Hello::Hello();
    std::cout << hello->speak();
    return 0;
}
