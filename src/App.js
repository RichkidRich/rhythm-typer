import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { motion } from "framer-motion";
import { generate } from 'random-words';
import { Container, Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useTimer } from "react-use-precision-timer";
import processSong from './songProcessor';

const BEAT_INTERVAL = 48;

function App() {

  const [targetParagraph, setTargetParagraph] = useState("");
  const [wordDifficulty, setWordDifficulty] = useState(7);
  const [songProcessing, setSongProcessing] = useState(false);
  const [songProcessed, setSongProcessed] = useState(false);
  const [songData, setSongData] = useState(null);

  const [songAudio, setSongAudio] = useState(null);
  const [beatAudio, setBeatAudio] = useState(null);

  const [readInputEnabled, setReadInputEnabled] = useState(false);

  const [songStarted, setSongStarted] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [beatCounter, setBeatCounter] = useState(0);

  const handleNewBeat = () => {
    // console.log(`count: ${beatCounter}`);
    if (songStarted) {
      const frameData = songData.noteData[currentFrame];
      const frameIndex = currentFrameIndex;
      const frameLength = frameData.length;

      const beatsPerIndex = BEAT_INTERVAL / frameLength;

      // console.log(frameData[frameIndex]);

      if (beatCounter === 0 && parseInt(frameData[frameIndex]) > 0 && parseInt(frameData[frameIndex]) < 8){
        console.log(`play ${frameData[frameIndex]}`);
      }

      if ((frameIndex + 1 === frameLength) && (beatCounter + 1 === beatsPerIndex)) {
        setCurrentFrameIndex(0);
        setCurrentFrame(currentFrame + 1);
      } else {
        if (!(frameIndex + 1 === frameLength) && (beatCounter + 1 === beatsPerIndex)) {
          setCurrentFrameIndex(frameIndex + 1);
        }
      }

      if (beatCounter + 1 === beatsPerIndex) {
        setBeatCounter(0);
      } else {
        setBeatCounter(beatCounter + 1);
      }

    }
  }

  const beatTimer = useTimer({
    delay: (60000 * 1 * 4 / (songData ? songData.bpm : 180))/BEAT_INTERVAL},
    handleNewBeat
  );

  const generateTargetParagraph = (numWords) => {
    const text = generate({ minLength: 3, maxLength: wordDifficulty, join: ' ', exactly: numWords });
  };

  const loadSong = async (setSongProcessed, setSongData) => {
    const tjaPath = "/Songs/Night of Knights/Night of Knights.tja";
    await processSong(tjaPath, setSongProcessed, setSongData);
  }

  const startSong = async () => {
    if (songAudio) {
      setReadInputEnabled(true);
      songAudio.currentTime = Math.abs(songData.offset);
      setInterval(() => {
        songAudio.play();
        setSongStarted(true);
      }, (60000 * 1 * 4 / (songData ? songData.bpm : 180)))
      startMetronome();
    } else {
      console.log('Song audio not loaded');
    }
  }

  const startMetronome = async () => {
    beatTimer.start();
  }

  useEffect(() => {
    setSongProcessing(true);
    loadSong(setSongProcessed, setSongData);
  }, []);

  useEffect(() => {
    if (songProcessed) {
      console.log('Processed Song Data:');
      console.log(songData);
      setSongAudio(new Audio(process.env.PUBLIC_URL + songData.songSource));
    }
  }, [songProcessed]);

  useEffect(() => {
    if (songAudio) {
      songAudio.load();
    }
  
  }, [songAudio]);

  const handleKeyDown = (event) => {
    if (readInputEnabled) {
      console.log(event.key);
    }
  }

  return (
    <div className="main-background" onKeyDown={handleKeyDown} tabIndex="0">
      <Container>
        <Row>
            <p className='main-header'>
              Rhythm Typer
            </p>
        </Row>
        <Row className="sub-header">
          <p>
            Where every round is a sight read round
          </p>
          <p>
            {"> Pick a song and type to the beat <"}
          </p>
        </Row>
        <Row className="play-row">
          <div className="play-button" onClick={startSong}>PLAY</div>
        </Row>
      </Container>
    </div>
  );
}

export default App;
