import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Waves } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type NoiseLevel = 0 | 1 | 2 | 3;

interface NeuralTuneProps {
  isPlaying?: boolean;
}

const NOISE_CONFIGS: Record<NoiseLevel, { label: string; description: string; color: string }> = {
  0: { label: "OFF", description: "Silent mode", color: "muted-foreground" },
  1: { label: "PINK NOISE", description: "Environment masking", color: "growth" },
  2: { label: "40Hz GAMMA", description: "High-intensity focus", color: "focus" },
  3: { label: "10Hz ALPHA", description: "Creative flow state", color: "warning" },
};

export function NeuralTune({ isPlaying = false }: NeuralTuneProps) {
  const [level, setLevel] = useState<NoiseLevel>(0);
  const [volume, setVolume] = useState(50);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{
    pinkNoise?: AudioBufferSourceNode;
    oscillator?: OscillatorNode;
    gainNode?: GainNode;
  }>({});

  const config = NOISE_CONFIGS[level];

  // Create pink noise buffer
  const createPinkNoiseBuffer = (audioContext: AudioContext) => {
    const bufferSize = 2 * audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    
    return buffer;
  };

  const stopAllAudio = () => {
    if (nodesRef.current.pinkNoise) {
      try {
        nodesRef.current.pinkNoise.stop();
      } catch (e) {}
    }
    if (nodesRef.current.oscillator) {
      try {
        nodesRef.current.oscillator.stop();
      } catch (e) {}
    }
    if (nodesRef.current.gainNode) {
      nodesRef.current.gainNode.disconnect();
    }
    nodesRef.current = {};
  };

  const playAudio = async () => {
    if (level === 0) {
      stopAllAudio();
      setIsAudioPlaying(false);
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const audioContext = audioContextRef.current;
    stopAllAudio();

    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume / 100 * 0.3;
    gainNode.connect(audioContext.destination);
    nodesRef.current.gainNode = gainNode;

    // Pink noise for all levels
    const pinkBuffer = createPinkNoiseBuffer(audioContext);
    const pinkSource = audioContext.createBufferSource();
    pinkSource.buffer = pinkBuffer;
    pinkSource.loop = true;
    pinkSource.connect(gainNode);
    pinkSource.start();
    nodesRef.current.pinkNoise = pinkSource;

    // Add binaural beats for levels 2 and 3
    if (level >= 2) {
      const frequency = level === 2 ? 40 : 10; // 40Hz gamma or 10Hz alpha
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      
      const oscGain = audioContext.createGain();
      oscGain.gain.value = 0.05;
      oscillator.connect(oscGain);
      oscGain.connect(gainNode);
      oscillator.start();
      nodesRef.current.oscillator = oscillator;
    }

    setIsAudioPlaying(true);
  };

  // Update audio when level or volume changes
  useEffect(() => {
    if (isPlaying && level > 0) {
      playAudio();
    } else {
      stopAllAudio();
      setIsAudioPlaying(false);
    }

    return () => {
      stopAllAudio();
    };
  }, [level, isPlaying]);

  // Update volume in real-time
  useEffect(() => {
    if (nodesRef.current.gainNode) {
      nodesRef.current.gainNode.gain.value = volume / 100 * 0.3;
    }
  }, [volume]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Waves className={cn(
            "h-4 w-4",
            isAudioPlaying ? `text-${config.color}` : "text-muted-foreground"
          )} />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Neural Tune
          </span>
        </div>
        {isAudioPlaying && (
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-0.5 rounded-full animate-pulse",
                  `bg-${config.color}`,
                  i === 0 && "h-2",
                  i === 1 && "h-3",
                  i === 2 && "h-2",
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Level selector */}
      <div className="grid grid-cols-4 gap-1">
        {([0, 1, 2, 3] as NoiseLevel[]).map((lvl) => {
          const cfg = NOISE_CONFIGS[lvl];
          return (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={cn(
                "p-2 rounded-lg border transition-all font-mono text-xs",
                level === lvl
                  ? "border-focus bg-focus/10 text-focus"
                  : "border-border bg-background/50 text-muted-foreground hover:border-muted-foreground"
              )}
            >
              {lvl === 0 ? <VolumeX className="h-3 w-3 mx-auto" /> : lvl}
            </button>
          );
        })}
      </div>

      {/* Current level info */}
      <div className="text-center">
        <p className={cn("font-mono text-xs", `text-${config.color}`)}>
          {config.label}
        </p>
        <p className="font-mono text-xs text-muted-foreground/50">
          {config.description}
        </p>
      </div>

      {/* Volume slider */}
      {level > 0 && (
        <div className="flex items-center gap-3">
          <Volume2 className="h-3 w-3 text-muted-foreground" />
          <Slider
            value={[volume]}
            onValueChange={([v]) => setVolume(v)}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="font-mono text-xs text-muted-foreground w-8">
            {volume}%
          </span>
        </div>
      )}
    </div>
  );
}
