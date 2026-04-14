import React, { useState } from "react";
import "./SkeletonImage.css";

const SkeletonImage = ({ src, alt, className, onError, ...rest }) => {
  const [carregou, setCarregou] = useState(false);

  return (
    <div className="skeleton-wrapper">
      {!carregou && <div className="skeleton-shimmer" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        className={`skeleton-img ${carregou ? "skeleton-img--visivel" : "skeleton-img--oculta"} ${className || ""}`}
        loading="lazy"
        onLoad={() => setCarregou(true)}
        onError={(e) => {
          setCarregou(true);
          onError?.(e);
        }}
        {...rest}
      />
    </div>
  );
};

export default SkeletonImage;
