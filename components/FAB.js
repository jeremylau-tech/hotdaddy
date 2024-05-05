"use client";

export default function FAB({ className, children, position, onClick }) {
  const getPosition = () => {
    switch (position) {
      case "topLeft":
        return "top-0 left-0";
      case "topRight":
        return "top-0 right-0";
      case "bottomLeft":
        return "bottom-[4rem] left-0";
      case "bottomRight":
        return "bottom-[4rem] right-0";
      default:
        return "top-0";
    }
  };

  return (
    <button
      onClick={onClick}
      className={`btn btn-accent rounded-3xl ${
        className ? className : ""
      } absolute ${getPosition()}`}
    >
      {children}
    </button>
  );
}
