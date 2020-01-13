import React from "react";

const NUM_OCTAVES = 7;
const KEYS_IN_OCTAVE = 12;

const getColor = keyNumberInOctave =>
  (keyNumberInOctave <= 5 && keyNumberInOctave % 2 === 1) || (keyNumberInOctave > 5 && keyNumberInOctave % 2 === 0)
    ? "white"
    : "black";

const PianoKey = ({ color, className }) => {
  console.log(className);
  return <div className={`${color === "black" ? "black-key" : "white-key"} ${className ? className : ""}`}></div>;
};

export default ({ keyClassNames }) => {
  return (
    <div className="piano">
      <PianoKey color="white" className={keyClassNames[0]} />
      <PianoKey color="black" className={keyClassNames[1]} />
      <PianoKey color="white" className={keyClassNames[2]} />
      {[...Array(NUM_OCTAVES)].map((val, octaveNum) => {
        return [...Array(KEYS_IN_OCTAVE)].map((val, idx) => {
          return <PianoKey color={getColor(idx + 1)} className={keyClassNames[octaveNum * KEYS_IN_OCTAVE + idx + 3]} />;
        });
      })}
      <PianoKey color="white" className={keyClassNames[87] !== undefined} />
    </div>
  );
};
