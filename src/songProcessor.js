async function readContentFromFile(filePath) {
    try {
        const response = await fetch(process.env.PUBLIC_URL + filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        return data;
    } catch (err) {
        console.error(`Error reading file from disk: ${err}`);
    }
};

const processSong = async (tjaFile, setSongProcessed, setSongData) => {
    console.log('Processing song...');

    const fileContent = await readContentFromFile(tjaFile);
    const fileLines = fileContent.split('\n');

    // console.log(fileLines);
    // navigator.clipboard.writeText(fileLines);

    let title = null;
    let subtitle = null;
    let bpm = null;
    let songSource = null;
    let offset = null;
    let demoStart = null;

    let difficulty = null;
    let balloons = [];
    let scoreInit = null;
    let scoreDiff = null;

    let beginChartProcess = false;
    let noteDataBegins = false;

    let extract = true;

    const noteDataArray = [];

    for (let i = 0; i < fileLines.length; i++) {
        const line = fileLines[i].split("/")[0];

        if (line.trim() === '') {
            continue;
        }

        if (!title) {
            if (line.includes('TITLE:')) {
                title = line.split(':')[1].trim();
                continue;
            }
        }

        if (!subtitle) {
            if (line.includes('SUBTITLE:')) {
                subtitle = line.split(':')[1].trim();
                continue;
            }
        }

        if (!bpm) {
            if (line.includes('BPM:')) {
                bpm = line.split(':')[1].trim();
                continue;
            }
        }

        if (!offset) {
            if (line.includes('OFFSET:')) {
                offset = line.split(':')[1].trim();
                continue;
            }
        }

        if (!demoStart) {
            if (line.includes('DEMOSTART:')) {
                demoStart = line.split(':')[1].trim();
                continue;
            }
        }

        if (!songSource) {
            if (line.includes('WAVE:')) {
                const songFile = line.split(':')[1].trim();
                songSource = `/Songs/${songFile.split('.')[0]}/${songFile}`;
                continue;
            }
        }
        if (!beginChartProcess) {
            if (line.includes('COURSE:') && line.toUpperCase().includes('NORMAL')) {
                beginChartProcess = true;
                continue;
            }
        } else {
            // process song chart data
            if (line.includes('#END')) {
                break;
            }

            if (noteDataBegins) {
                if (line.includes('#')) {
                    if (!extract && line.includes('#M')) {
                        extract = true;
                    }
                    if (line.includes('BRANCHSTART')) {
                        extract = false;
                    }
                    continue;
                }

                if (extract) {
                    noteDataArray.push(line.split(',')[0]);
                }
            }

            if (line.includes('#START')) {
                noteDataBegins = true;
                continue;
            }
            
            if (line.includes('LEVEL:')) {
                difficulty = line.split(':')[1].trim();
                continue;
            } else if (line.includes('SCOREINIT:')) {
                scoreInit = line.split(':')[1].trim();
                continue;
            } else if (line.includes('SCOREDIFF:')) {
                scoreDiff = line.split(':')[1].trim();
                continue;
            } else if (line.includes('BALLOON:')) {
                const balloonData = line.split(':')[1].split(',');
                balloons = balloonData;
                continue;
            }
        }
    }

    const songData = {
        title: title,
        subtitle: subtitle,
        bpm: bpm,
        songSource: songSource,
        offset: offset,
        demoStart: demoStart,
        difficulty: difficulty,
        scoreInit: scoreInit,
        scoreDiff: scoreDiff,
        noteData: noteDataArray,
    };

    setSongData(songData);
    setSongProcessed(true);
};

export default processSong;