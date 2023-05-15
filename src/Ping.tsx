import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function Ping() {
  const [testing, setTesting] = useState(false);
  const [latency, setLatency] = useState<undefined | number>(undefined);

  useEffect(() => {
    const audioContext = new window.AudioContext();
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(async (stream) => {
        const sourceNode = audioContext.createMediaStreamSource(stream);
        const analyzerNode = audioContext.createAnalyser();
        const oscillatorNode = audioContext.createOscillator();
        oscillatorNode.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillatorNode.type = 'sine';

        oscillatorNode.connect(audioContext.destination);
        sourceNode.connect(analyzerNode);

        if (testing) {
          oscillatorNode.start(audioContext.currentTime + 1);
          oscillatorNode.stop(audioContext.currentTime + 1.2);
          await awaitPong(
            analyzerNode,
            audioContext.currentTime + 1.1,
            audioContext,
            setTesting,
            setLatency
          );
        }
      })
      .catch((error) => console.log('Error getting user media:', error));
  }, [testing]);

  return (
    <div>
      <button onClick={() => setTesting(true)}>
        Ping
        {latency ? `: ${(latency * 1000).toFixed(0)} milliseconds` : undefined}
      </button>
    </div>
  );
}

export default Ping;

async function awaitPong(
  analyzerNode: AnalyserNode,
  startTime: number,
  audioContext: AudioContext,
  setTesting: Dispatch<SetStateAction<boolean>>,
  setLatency: Dispatch<SetStateAction<number | undefined>>
) {
  const endTime = audioContext.currentTime;
  const frequencyData = new Uint8Array(analyzerNode.frequencyBinCount);
  analyzerNode.getByteFrequencyData(frequencyData);
  const maxAmplitude = Math.max(...frequencyData);

  if (maxAmplitude > 200 && endTime > startTime) {
    setLatency(endTime - startTime);
    setTesting(false);
  } else
    requestAnimationFrame(() =>
      awaitPong(analyzerNode, startTime, audioContext, setTesting, setLatency)
    );
}
