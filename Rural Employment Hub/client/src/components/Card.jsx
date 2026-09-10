import React from "react";

const Card = ({ children, className = "", variant = "default", ...props }) => {
  let baseClass = "card";
  if (variant === "gov") baseClass = "card-gov";
  else if (variant === "glass") baseClass = "card-glass";

  return (
    <div className={`${baseClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
