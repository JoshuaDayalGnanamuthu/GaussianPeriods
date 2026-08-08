#include <cmath>
#include <thread>
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
  std::vector<gaussianPoint> points(n);

  w %= n;

  // 1. Precompute residue cycle once
  std::vector<size_t> residues;
  size_t residue = 1;

  do {
    residues.push_back(residue);
    residue = (residue * w) % n;
  } while (residue != 1);

  // 2. Precompute all roots of unity once
  std::vector<std::pair<double, double>> roots(n);

  for (size_t i = 0; i < n; ++i) {
    double angle = 2.0 * PI * i / n;
    roots[i] = {std::cos(angle), std::sin(angle)};
  }

  unsigned int numThreads = std::thread::hardware_concurrency();
  if (numThreads == 0) numThreads = 4;

  size_t chunkSize = (n + numThreads - 1) / numThreads;

  auto worker = [&](size_t start, size_t end) {
    for (size_t k = start; k < end; ++k) {
      gaussianPoint point;

      for (size_t r : residues) {
        size_t index = (k * r) % n;

        point.real += roots[index].first;
        point.imag += roots[index].second;
      }

      point.color = k % c;
      points[k] = point;
    }
  };

  std::vector<std::thread> threads;

  for (size_t t = 0; t < numThreads; ++t) {
    size_t start = t * chunkSize;
    size_t end = std::min(start + chunkSize, n);

    if (start < end) {
      threads.emplace_back(worker, start, end);
    }
  }

  for (std::thread& thread : threads) {
    thread.join();
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

  std::vector<gaussianPoint> points = gaussianPeriodPoints(n, w, c);
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

      sf::Color(255, 128, 0),    // Orange
      sf::Color(128, 0, 255),    // Purple
      sf::Color(255, 0, 128),    // Pink
      sf::Color(128, 255, 0),    // Lime
      sf::Color(0, 128, 255),    // Sky Blue
      sf::Color(255, 128, 128),  // Salmon

      sf::Color(128, 255, 255),  // Light Cyan
      sf::Color(255, 255, 128),  // Light Yellow
      sf::Color(192, 64, 64),    // Brick Red
      sf::Color(64, 192, 64),    // Forest Green
      sf::Color(64, 64, 192),    // Deep Blue
      sf::Color(192, 64, 192),   // Violet

      sf::Color(64, 192, 192),   // Teal
      sf::Color(192, 192, 64),   // Olive
      sf::Color(255, 64, 64),    // Bright Red
      sf::Color(64, 255, 64),    // Bright Green
      sf::Color(64, 64, 255),    // Bright Blue
      sf::Color(255, 64, 255),   // Bright Magenta

      sf::Color(64, 255, 255),   // Bright Cyan
      sf::Color(255, 255, 64),   // Bright Yellow
      sf::Color(255, 165, 0),    // Dark Orange
      sf::Color(75, 0, 130),     // Indigo
      sf::Color(238, 130, 238),  // Violet
      sf::Color(0, 255, 127)     // Spring Green
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
    float radius = std::clamp(scale / 25.0f, 1.0f, 8.0f);
    
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

      sf::CircleShape dot(radius);
      dot.setOrigin({radius, radius});
      dot.setPosition({x, y});
      dot.setFillColor(colors[point.color % colors.size()]);

      window.draw(dot);
    }
    window.display();
  }
 
  return 0;
}
