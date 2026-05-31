GCC = clang++
CFLAGS = -std=c++17 -Wall -Wextra -pedantic -g
LDFLAGS = -I/opt/homebrew/include -L/opt/homebrew/lib -lsfml-graphics -lsfml-window -lsfml-system -lsfml-audio
SRCS = visualization.cpp

gauss: $(SRCS)
	$(GCC) $(CFLAGS) $(SRCS) -o gauss $(LDFLAGS)

clean:
	rm -f gauss
