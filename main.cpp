#include <bit>
#include <chrono>
#include <cstdint>
#include <emscripten/emscripten.h>
// #include <iostream>

int
main () {
	// std::cout << "Hello World\n";
	return 0;
}
struct Snowflake {
	inline static unsigned int _increment{ 0 };
	uint64_t				   increment : 12 = _increment++;
	uint64_t				   processID : 5;
	uint64_t				   workerID : 5;
	uint64_t				   timestamp : 42;
	Snowflake (unsigned int t_processID, unsigned int t_workerID, uint64_t t_timestamp)
		: processID (t_processID), workerID (t_workerID), timestamp (t_timestamp) {}
};

extern "C" {
EMSCRIPTEN_KEEPALIVE uint64_t
genSnowflake (unsigned int processID, unsigned int workerID) {
	using namespace std::literals;
	auto	 start = std::chrono::system_clock::now ();
	auto	 epoch = std::chrono::system_clock::time_point (1687525200000ms);
	uint64_t timestamp = (start - epoch) / 1ms;
	return std::bit_cast<std::uint64_t> (Snowflake{ processID, workerID, timestamp });
}
}
