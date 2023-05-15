import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function Pong() {
  const [listen, setListen] = useState(false);

  useEffect(() => {
    const audioContext = new window.AudioContext();
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(async (stream) => {
        const sourceNode = audioContext.createMediaStreamSource(stream);
        const analyzerNode = audioContext.createAnalyser();
        const oscillatorNode = audioContext.createOscillator();
        oscillatorNode.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillatorNode.type = 'sine';

        oscillatorNode.connect(audioContext.destination);
        sourceNode.connect(analyzerNode);

        if (listen) {
          await checkThreshold(
            analyzerNode,
            oscillatorNode,
            audioContext,
            setListen
          );
        }
      })
      .catch((error) => console.log('Error getting user media:', error));
  }, [listen]);

  return (
    <div>
      <button onClick={() => setListen(true)}>Prepare pong</button>
    </div>
  );
}

export default Pong;

async function checkThreshold(
  analyzerNode: AnalyserNode,
  oscillatorNode: OscillatorNode,
  audioContext: AudioContext,
  setListen: Dispatch<SetStateAction<boolean>>
) {
  const frequencyData = new Uint8Array(analyzerNode.frequencyBinCount);
  analyzerNode.getByteFrequencyData(frequencyData);

  const maxAmplitude = Math.max(...frequencyData);

  if (maxAmplitude > 200) {
    console.log(maxAmplitude);
    oscillatorNode.start();
    oscillatorNode.stop(audioContext.currentTime + 0.1);
    setListen(false);
  } else
    requestAnimationFrame(() =>
      checkThreshold(analyzerNode, oscillatorNode, audioContext, setListen)
    );
}
