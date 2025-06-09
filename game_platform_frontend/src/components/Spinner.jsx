/* eslint-disable react/prop-types */
const Spinner = ({ size = 6, color = "#ffffff" }) => (
  <div className="flex justify-center items-center">
    <div
      className={`w-${size} h-${size} border-4 border-t-transparent border-solid rounded-full animate-spin`}
      style={{ borderColor: `${color} transparent ${color} transparent` }} // Apply color to the spinner
    ></div>
  </div>
);

export default Spinner;

