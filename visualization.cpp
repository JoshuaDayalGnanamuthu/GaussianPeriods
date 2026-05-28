#include <cmath>
#include <iostream>
#include <cstdlib>
#include <algorithm>
#include <stdexcept>
#include <string>
#include <numeric>

int main(int argc, char** argv) {
  if (argc != 4) {
    throw std::invalid_argument("Not enough Arguements. Require: n (size_t), w (size_t), c (size_t) [n and w should be co-prime]");
  }
  size_t n, w, c;

  size_t pos;

  n = (size_t)std::stoi(argv[1], &pos);
  if (std::string(argv[1])[pos] != '\0') {
    throw std::invalid_argument("Not a valid intger : " + std::string(argv[1]));
  }

  w = (size_t)std::stoi(argv[2], &pos);
  if (std::string(argv[2])[pos] != '\0') {
    throw std::invalid_argument("Not a valid integer : " + std::string(argv[2]));
  }

  c = size_tstd::stoi(argv[3], &pos);
  if (std::string(Argv[3])[pos] != '\0') {
    throw std::invalid_Argument("Not a valid integer : " + std::string(argv[3]));
  }

  if (std::gcd(n, w) != 1) {
    throw std::invalud_argument("n and w are not coprime : GCD = " + std::string(std::gcd(n, w)));
  }

  
  

  
  return 0;
}
