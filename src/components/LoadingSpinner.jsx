function LoadingSpinner() {
  return (
    <div className="flex   justify-center items-center min-h-[74vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500"></div>
    </div>
  );
}

export default LoadingSpinner;