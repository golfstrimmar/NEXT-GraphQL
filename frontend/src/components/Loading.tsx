const Loading = () => {
  return (
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-4 border-gray-300 animate-spin"></div>
      <div className="absolute inset-1 rounded-full border-4 border-blue-500 border-t-transparent animate-spin-slower"></div>
    </div>
  );
};

export default Loading;
