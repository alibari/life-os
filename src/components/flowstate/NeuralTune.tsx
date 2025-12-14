import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Waves, Settings2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type NoiseLevel = 0 | 1 | 2 | 3;

interface NeuralTuneProps {
  isPlaying?: boolean;
}

const NOISE_CONFIGS: Record<NoiseLevel, { label: string; shortLabel: string; color: string }> = {
  0: { label: "OFF", shortLabel: "OFF", color: "muted-foreground" },
  1: { label: "PINK", shortLabel: "PNK", color: "growth" },
  2: { label: "40Hz γ", shortLabel: "40γ", color: "focus" },
  3: { label: "10Hz α", shortLabel: "10α", color: "warning" },
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
      try { nodesRef.current.pinkNoise.stop(); } catch (e) {}
    }
    if (nodesRef.current.oscillator) {
      try { nodesRef.current.oscillator.stop(); } catch (e) {}
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

    const pinkBuffer = createPinkNoiseBuffer(audioContext);
    const pinkSource = audioContext.createBufferSource();
    pinkSource.buffer = pinkBuffer;
    pinkSource.loop = true;
    pinkSource.connect(gainNode);
    pinkSource.start();
    nodesRef.current.pinkNoise = pinkSource;

    if (level >= 2) {
      const frequency = level === 2 ? 40 : 10;
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

  useEffect(() => {
    if (nodesRef.current.gainNode) {
      nodesRef.current.gainNode.gain.value = volume / 100 * 0.3;
    }
  }, [volume]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "relative flex items-center justify-center w-10 h-10 rounded-lg border transition-all",
            isAudioPlaying 
              ? "border-focus bg-focus/10 text-focus" 
              : "border-border bg-background/50 text-muted-foreground hover:border-muted-foreground"
          )}
        >
          <Waves className="h-4 w-4" />
          {isAudioPlaying && (
            <div className="absolute -top-1 -right-1 flex items-center justify-center">
              <span className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                level === 1 && "bg-growth",
                level === 2 && "bg-focus",
                level === 3 && "bg-warning"
              )} />
            </div>
          )}
          {level > 0 && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 font-mono text-[8px] font-bold">
              {config.shortLabel}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" className="w-56 p-3 bg-card border-border">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Neural Tune
            </span>
            <Settings2 className="h-3 w-3 text-muted-foreground" />
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
                    "p-1.5 rounded border transition-all font-mono text-[10px]",
                    level === lvl
                      ? "border-focus bg-focus/10 text-focus"
                      : "border-border bg-background/50 text-muted-foreground hover:border-muted-foreground"
                  )}
                >
                  {lvl === 0 ? <VolumeX className="h-3 w-3 mx-auto" /> : cfg.shortLabel}
                </button>
              );
            })}
          </div>

          {/* Current level */}
          <div className="text-center py-1">
            <p className={cn("font-mono text-xs font-medium", `text-${config.color}`)}>
              {config.label}
            </p>
          </div>

          {/* Volume */}
          {level > 0 && (
            <div className="flex items-center gap-2 pt-1 border-t border-border">
              <Volume2 className="h-3 w-3 text-muted-foreground shrink-0" />
              <Slider
                value={[volume]}
                onValueChange={([v]) => setVolume(v)}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="font-mono text-[10px] text-muted-foreground w-6 text-right">
                {volume}
              </span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
