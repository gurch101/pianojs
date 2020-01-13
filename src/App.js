import React from "react";
import { Midi } from "@tonejs/midi";
import Slider from "rc-slider";
import Piano from "./Piano";
import "rc-slider/assets/index.css";
import "./App.css";
import wheresmymind from "./wheresmymind.mid";
import classNames from "classnames";
const Soundfont = require("soundfont-player");

const midiNoteToIndex = note => note - 21;
const indexToMidiNote = idx => idx + 21;
const getNoteClassName = (note, currentTick) => {
  return classNames({
    "rh-selected": note.rh,
    selected: !note.rh,
    sustain: currentTick > note.ticks
  });
};

class App extends React.Component {
  state = {
    currentTickIndex: -1,
    midi: {},
    selectedKeys: {},
    notes: []
  };
  async componentDidMount() {
    const midi = await Midi.fromUrl(wheresmymind);
    const notes = [
      ...midi.tracks[0].notes,
      ...(midi.tracks[1] ? midi.tracks[1].notes : []).map(note => ({ ...note, rh: true }))
    ];
    notes.sort((a, b) => (a.ticks - b.ticks === 0 ? a.durationTicks - b.durationTicks : a.ticks - b.ticks));
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
      .map(note => ({ rh: note.rh, ticks: note.ticks, key: midiNoteToIndex(note.midi) }))
      .reduce((acc, curr) => ({ ...acc, [curr.key]: getNoteClassName(curr, tick) }), {});
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
      .filter(note => this.state.selectedKeys[note].indexOf("sustain") < 0)
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
        <Piano keyClassNames={this.state.selectedKeys} />
      </div>
    );
  }
}

export default App;
