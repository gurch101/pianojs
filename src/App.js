import React from "react";
import { Midi } from "@tonejs/midi";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "./App.css";
import wheresmymind from "./wheresmymind.mid";
const Soundfont = require("soundfont-player");

const NUM_OCTAVES = 7;
const KEYS_IN_OCTAVE = 12;

const getColor = keyNumberInOctave =>
  (keyNumberInOctave <= 5 && keyNumberInOctave % 2 === 1) || (keyNumberInOctave > 5 && keyNumberInOctave % 2 === 0)
    ? "white"
    : "black";

const midiNoteToIndex = note => note - 21;
const indexToMidiNote = idx => idx + 21;

function Piano({ selectedKeys }) {
  return (
    <div className="piano">
      <PianoKey color="white" selected={selectedKeys[0] !== undefined} />
      <PianoKey color="black" selected={selectedKeys[1] !== undefined} />
      <PianoKey color="white" selected={selectedKeys[2] !== undefined} />
      {[...Array(NUM_OCTAVES)].map((val, octaveNum) => {
        return [...Array(KEYS_IN_OCTAVE)].map((val, idx) => {
          return (
            <PianoKey
              color={getColor(idx + 1)}
              selected={selectedKeys[octaveNum * KEYS_IN_OCTAVE + idx + 3] !== undefined}
            />
          );
        });
      })}
      <PianoKey color="white" selected={selectedKeys[87] !== undefined} />
    </div>
  );
}

const PianoKey = ({ color, selected }) => (
  <div className={`${color === "black" ? "black-key" : "white-key"} ${selected ? "selected" : ""}`}></div>
);

class App extends React.Component {
  state = {
    currentTickIndex: -1,
    midi: {},
    selectedKeys: {},
    notes: []
  };
  async componentDidMount() {
    const midi = await Midi.fromUrl(wheresmymind);
    const notes = [...midi.tracks[0].notes, ...(midi.tracks[1] ? midi.tracks[1].notes : [])];
    notes.sort((a, b) => (a.ticks - b.ticks === 0 ? a.durationTicks - b.durationTicks : a.ticks - b.ticks));
    console.log(notes);
    this.piano = await Soundfont.instrument(new AudioContext(), "acoustic_grand_piano");
    this.setState({
      midi,
      notes
    });
  }

  getNotesForTick = tick => {
    const notes = this.state.notes;
    return notes
      .filter(note => note.ticks === tick || (note.ticks <= tick && note.ticks + note.durationTicks > tick))
      .map(note => midiNoteToIndex(note.midi))
      .reduce((acc, curr) => ({ ...acc, [curr]: true }), {});
  };

  previous = () => {
    const notes = this.state.notes;
    const currentNoteIndex = notes.findIndex(note => note.ticks === notes[this.state.currentTickIndex].ticks);
    if (currentNoteIndex > 0) {
      const selectedNotes = this.getNotesForTick(notes[currentNoteIndex - 1].ticks);
      this.setState({
        currentTickIndex: currentNoteIndex - 1,
        selectedKeys: selectedNotes
      });
    }
  };

  next = () => {
    const notes = this.state.notes;
    let nextTickIndex = 0;
    if (this.state.currentTickIndex !== -1) {
      nextTickIndex = notes.findIndex(note => note.ticks > notes[this.state.currentTickIndex].ticks);
    }
    const selectedNotes = this.getNotesForTick(notes[nextTickIndex].ticks);
    this.setState({
      currentTickIndex: nextTickIndex,
      selectedKeys: selectedNotes
    });
  };

  updatePosition = e => {
    const notes = this.state.notes;
    this.setState({
      currentTickIndex: e,
      selectedKeys: this.getNotesForTick(notes[e].ticks)
    });
  };

  play = () => {
    Object.keys(this.state.selectedKeys)
      .map(note => indexToMidiNote(parseInt(note)))
      .forEach(note => {
        this.piano.play(note);
      });
  };

  render() {
    return (
      <div>
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <p style={{ color: "white" }}>{this.state.currentTickIndex}</p>
          <button className="mr1" onClick={this.previous}>
            Previous
          </button>
          <button className="mr1" onClick={this.next}>
            Next
          </button>
          <button onClick={this.play}>Play</button>
        </div>
        <div style={{ width: "50%", margin: "0 auto", marginBottom: "10px" }}>
          <Slider
            min={0}
            max={this.state.notes.length - 1}
            onChange={this.updatePosition}
            value={this.state.currentTickIndex}
          />
        </div>
        <Piano selectedKeys={this.state.selectedKeys} />
      </div>
    );
  }
}

export default App;
