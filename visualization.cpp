#include <cmath>
#include <iostream>
#include <cstdlib>
#include <algorithm>
#include <stdexcept>
#include <string>
#include <numeric>
#include <SFML/Window.hpp>
#include <SFML/Graphics.hpp>
#include <vector>

const double PI = std::acos(-1.0);

typedef struct gaussianPoint {
  double real = 0.0;
  double imag = 0.0;
  size_t color = 0;
} guassianPoint;
  
std::vector<gaussianPoint> gaussianPeriodPoints(size_t n, size_t w, size_t c) {
  std::vector<gaussianPoint> points;

  for ( size_t k {}; k < n; ++k ) {
    gaussianPoint point;
    size_t residue = 1;

    do {
      double angle = 2.0 * PI * k * residue / n;

      point.real += std::cos(angle);
      point.imag += std::sin(angle);

      residue = (residue * w) % n;
    } while ( residue != 1);

    point.color = k % c;
    points.push_back(point);
  }

  return points;
}

int main(int argc, char** argv) {
  if (argc != 4) {
    throw std::invalid_argument("Not enough Arguements. Require: n (size_t), w (size_t), c (size_t) [n and w should be co-prime]");
  }
  size_t n, w, c;

  size_t pos;

  n = (size_t)std::stoi(argv[1], &pos);
  if (std::string(argv[1])[pos] != '\0') {
    throw std::invalid_argument(std::string("Not a valid intger : ") + argv[1]);
  }

  w = (size_t)std::stoi(argv[2], &pos);
  if (std::string(argv[2])[pos] != '\0') {
    throw std::invalid_argument(std::string("Not a valid integer : ") + argv[2]);
  }

  c = (size_t)std::stoi(argv[3], &pos);
  if (std::string(argv[3])[pos] != '\0') {
    throw std::invalid_argument(std::string("Not a valid integer : ") + argv[3]);
  }

  if (std::gcd(n, w) != 1) {
    throw std::invalid_argument("n and w are not coprime : GCD = " + std::to_string(std::gcd(n, w)));
  }

  // std::vector<gaussianPoint> points = gaussianPeriodPoints(n, w, c);
  //for ( const gaussianPoint &point : points) {
  // std::cout << point.real << " + " << point.imag << "i" << " color shcema : " << point.color << std::endl;
  //}
  
  sf::RenderWindow window(sf::VideoMode({800, 600}), "Gaussian Periods", sf::Style::Default, sf::State::Windowed); // The default style, which is a shortcut for Titlebar | Resize | Close

  std::vector<sf::Color> colors = {
    sf::Color::Red,
    sf::Color::Green,
    sf::Color::Blue,
    sf::Color::Yellow,
    sf::Color::Magenta,
    sf::Color::Cyan,
    sf::Color::Magenta,
  };

  double maxAbs = 0.0;
  for ( const gaussianPoint& point : points) {
    double dist = std::sqrt(point.real * point.real + point.imag * point.imag);
    maxAbs = std::max(maxAbs, dist);
  }

  if (maxAbs == 0.0) maxAbs = 1.0;
  
  while (window.isOpen()) {
    while (const std::optional event = window.pollEvent()) {
      if (event->is<sf::Event::Closed>()) window.close();
    }

    window.clear(sf::Color::Black);
    
    sf::Vector2u windowSize = window.getSize();
    sf::CircleShape shape(50.f);
    shape.setFillColor(sf::Color(100, 250, 50));
    auto [width, height] = windowSize;
    
    float centerX = width / 2.0f;
    float centerY = height/ 2.0f;

    float scale = 0.4f * std::min(width, height) / static_cast<float>(maxAbs);

    sf::VertexArray axes(sf::PrimitiveType::Lines, 4);

    axes[0].position = {0.f, centerY};
    axes[1].position = {static_cast<float>(width), centerY};
    axes[2].position = {centerX, 0.f};
    axes[3].position = {centerX, static_cast<float>(height)};

    for ( size_t i {}; i < 4; ++i ) {
      axes[i].color = sf::Color::White;
    }

    window.draw(axes);

    for ( const gaussianPoint& point : points) {
      float x = centerX + static_cast<float>(point.real) * scale;
      float y = centerY - static_cast<float>(point.imag) * scale;

      sf::CircleShape dot(5.f);
      dot.setOrigin({5.f, 5.f});
      dot.setPosition({x, y});
      dot.setFillColor(colors[point.color % colors.size()]);

      window.draw(dot);
    }
    window.display();
  }
 
  return 0;
}
