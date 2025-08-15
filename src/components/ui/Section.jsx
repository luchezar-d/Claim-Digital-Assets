import React from 'react';

const Section = ({ id, className = '', children }) => {
  return (
    <section id={id} className={`py-16 md:py-24 ${className}`}>
      {children}
    </section>
  );
};

export default Section;
