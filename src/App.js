import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AnimatePresence, motion } from "framer-motion";
import { generate } from 'random-words';
import { Container, Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useTimer } from "react-use-precision-timer";
import processSong from './songProcessor';
import React from 'react';

const BEAT_INTERVAL = 192;

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
  const [barCounter, setBarCounter] = useState(0);

  const [showDon, setShowDon] = useState(false);
  const [showKa, setShowKa] = useState(false);
  const [showBar, setShowBar] = useState(false);

  const [chartBars, setChartBars] = useState([]);

  const [roundWords, setRoundWords] = useState([]);
  const [currentWordRender, setCurrentWordRender] = useState(0);
  const [currentWordRenderIndex, setCurrentWordRenderIndex] = useState(0);

  const handleNewBeat = () => {
    // console.log(`count: ${beatCounter}`);
    if (songStarted) {
      const frameData = songData.noteData[currentFrame];
      const frameIndex = currentFrameIndex;
      const frameLength = frameData.length;

      const beatsPerIndex = BEAT_INTERVAL / frameLength;

      // console.log(frameData[frameIndex]);
      if (barCounter === 0 || barCounter === 60 || barCounter === 120 || barCounter === 180) {
        // console.log('>BEAT<')
        // setShowBar(true);
      } else {
        // setShowBar(false);
      }

      setBarCounter(barCounter + 1);
      if (barCounter === BEAT_INTERVAL) {
        setBarCounter(0);
      }

      if (beatCounter === 0 && parseInt(frameData[frameIndex]) > 0 && parseInt(frameData[frameIndex]) < 8){
        console.log(roundWords[currentWordRender]);
        console.log(currentWordRender, currentWordRenderIndex)
        // console.log(`play ${frameData[frameIndex]}`);
        if (frameData[frameIndex] === '1' || frameData[frameIndex] === '2' || frameData[frameIndex] === '3' || frameData[frameIndex] === '4') {
          if (currentWordRenderIndex + 1 === roundWords[currentWordRender].length) {
            setCurrentWordRender(currentWordRender + 1);
            setCurrentWordRenderIndex(0);
          } else {
            setCurrentWordRenderIndex(currentWordRenderIndex + 1);
          }
        } else if (frameData[frameIndex] === '5' || frameData[frameIndex] === '6') {
          // setShowDon(true);
          // setShowKa(true);
        } else {
          // setShowDon(false);
          // setShowKa(false);
        }
      } else {
        // setShowDon(false);
        // setShowKa(false);
      }

      console.log(`frameIndex: ${frameIndex}, beatsPerIndex: ${beatsPerIndex}, beatCounter: ${beatCounter}, frameLength: ${frameLength}`);

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
    delay: (Math.ceil(60000 * 1 * 4 / (songData ? songData.bpm : 180))/BEAT_INTERVAL)},
    handleNewBeat
  );

  const generateTargetParagraph = (numCharacters) => {
    const text = generate({ minLength: 3, maxLength: wordDifficulty, join: ' ', exactly: numCharacters * 3 });
    return text;
  };

  const loadSong = async (setSongProcessed, setSongData) => {
    const tjaPath = "/Songs/Night of Knights/Night of Knights.tja";
    await processSong(tjaPath, setSongProcessed, setSongData);
  }

  const startSong = async () => {
    if (songAudio) {
      const audioDuration = songAudio.duration;
      document.getElementsByClassName('fullchart')[0].style.animationDuration = `${audioDuration + parseFloat(songData.offset) + Math.ceil(60 * 1 * 4 / (songData ? songData.bpm : 180))/BEAT_INTERVAL}s`;
      document.getElementsByClassName('fullchart')[0].classList.add('sliding');
      
      setReadInputEnabled(true);
      songAudio.currentTime = Math.abs(songData.offset);
      setInterval(() => {
        songAudio.play();
        setSongStarted(true);
      }, (Math.ceil(60000 * 1 * 4 / (songData ? songData.bpm : 180))/BEAT_INTERVAL) + Math.ceil(60000 * 1 * 4 / (songData ? songData.bpm : 180)) / 1.5);
      startMetronome();
    } else {
      console.log('Song audio not loaded');
    }
  }

  const startMetronome = async () => {
    beatTimer.start();
  }

  let rolling = false;
  let currentRollNote = 1;

  let ballooning = false;
  let currentBallooning = 1;

  let currentWord = 0;
  let currentWordChar = 0;

  const buildBarRender = (frameNumbers) => {
    const hitPointRender = [];

    // console.log(currentWord, currentWordChar)

    for (let i = 0; i < frameNumbers.length; i++) {
      // console.log(`frame number ${frameNumbers[i]} and i ${i}`);
      if (frameNumbers[i] === '1' || frameNumbers[i] === '2' || frameNumbers[i] === '3' || frameNumbers[i] === '4') {
        hitPointRender.push(
          <div className="single-note">
            {(roundWords[currentWord])[currentWordChar]}
          </div>
        );
        if (currentWordChar + 1 === roundWords[currentWord].length) {
          currentWord++;
          currentWordChar = 0;
        } else {  
          currentWordChar++;
        }
      } else if (frameNumbers[i] === '0' && !rolling && !ballooning) {
        hitPointRender.push(
          <div className="empty-note">
            {frameNumbers[i]}
          </div>
        );
      } else if (frameNumbers[i] === '6' || frameNumbers[i] === '5') {
        rolling = true;
      } else if (frameNumbers[i] === '0' && rolling) {
        currentRollNote++;
      } else if (frameNumbers[i] === '8' && rolling) {
        rolling = false;
        const rollStyle = { width: `${7 * currentRollNote}vw` };

        currentRollNote = 1;

        hitPointRender.push(
          <div style={rollStyle} className='roll-note'>
            
          </div>
        );
      } else if (frameNumbers[i] === '7') {
        ballooning = true;
      } else if (frameNumbers[i] === '0' && ballooning) {
        currentBallooning++;
      } else if (frameNumbers[i] === '8' && ballooning) {
        ballooning = false;
        const balloonStyle = { width: `${7 * currentBallooning}vw` };

        currentBallooning = 1;

        hitPointRender.push(
          <div style={balloonStyle} className='balloon-note'>
            
          </div>
        );
      } else if (frameNumbers[i] === '9') {
        hitPointRender.push(
          <div className="mallet-note">
            
          </div>
        );
      }
    }

    setCurrentWordRender(currentWord);
    setCurrentWordRenderIndex(currentWordChar);

    return (
      <div className={`single-bar beat-width-${frameNumbers.length}`}>
        {hitPointRender}
      </div>
    );
  }

  const renderChart = async (tempData) => {
    const tempBars = chartBars;

    tempData.noteData.forEach((frame, index) => {
      tempBars.push(buildBarRender(frame));
    });
    currentWord = 0;
    currentWordChar = 0;
    setChartBars(tempBars);
  }

  useEffect(() => {
    setSongProcessing(true);
    loadSong(setSongProcessed, setSongData);
  }, []);

  useEffect(() => {
    if (songProcessed) {
      console.log('Processed Song Data:');
      console.log(songData);
      const totalCharacters = songData.noteData.reduce((sum, note) => sum + note.length, 0);
      const wordArray = generateTargetParagraph(totalCharacters).split(' ');
      console.log(wordArray)
      setRoundWords(wordArray);
      setSongAudio(new Audio(process.env.PUBLIC_URL + songData.songSource));
    }
  }, [songProcessed]);

  useEffect(() => {
    if (songAudio) {
      songAudio.load();
      document.getElementsByClassName('fullchart')[0].style.width = `${150*(songData.noteData.length + 1)}vw`;
      renderChart(songData);
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
        <Row className="current-word-render">
          {roundWords[currentWordRender]}
        </Row>
      </Container>
      <div className='fullchart'>
        {chartBars}
      </div>
      {
        showDon ? 
          <AnimatePresence>
            <motion.div
              className="don"></motion.div>
          </AnimatePresence> : null
      }
      {
        showKa ? 
          <AnimatePresence>
            <motion.div className="ka"></motion.div>
          </AnimatePresence> : null
      }
      {
        showBar ? 
          <AnimatePresence>
            <motion.div className="bar"></motion.div>
          </AnimatePresence> : null
      }
    </div>
  );
}

export default App;
