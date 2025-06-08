export default function Summary() {
  return (
    <div className="grid grid-cols-3 grid-rows-4 gap-4 bg-transparent p-4 rounded-lg w-[90%] text-blue-950">
      {/* Row 1 */}
      <div className="bg-white rounded shadow p-2">
        <div>Test Started</div>
        <div>47</div>
      </div>
      <div className="bg-white p-2 rounded shadow">
        <div>Test Completed</div>
        <div>30</div>
      </div>
      <div className="bg-white p-2 rounded shadow">
        <div>Time Typing</div>
        <div>12:30:34</div>
      </div>
      {/* Row 2 */}
      <div className="bg-white p-2 rounded shadow">
        <div>Highest WPM</div>
        <div>123</div>
      </div>
      <div className="bg-white p-2 rounded shadow">
        <div>Average WPM</div>
        <div>123</div>
      </div>
      <div className="bg-white p-2 rounded shadow">
        <div>Average WPM (last 10 tests)</div>
        <div>87</div>
      </div>
      {/* Row 3 */}
      <div className="bg-white p-2 rounded shadow">
        <div>Highest raw WPM</div>
        <div>123</div>
      </div>
      <div className="bg-white p-2 rounded shadow">
        <div>Average raw WPM</div>
        <div>87</div>
      </div>
      <div className="bg-white p-2 rounded shadow">
        <div>Average raw WPM (last 10 tests)</div>
        <div>89</div>
      </div>
      {/* Row 4 */}
      <div className="bg-white p-2 rounded shadow">
        <div>Highest Accuracy</div>
        <div>100%</div>
      </div>
      <div className="bg-white p-2 rounded shadow">
        <div>Average Accuracy</div>
        <div>98%</div>
      </div>
      <div className="bg-white p-2 rounded shadow">
        <div>Average Accuracy (last 10 tests)</div>
        <div>97%</div>
      </div>
    </div>
  );
}
