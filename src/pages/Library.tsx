import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { setPageSEO } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AudioProgressBar = ({ isPlaying, currentTime, duration, onSeek, onClose, title }) => {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(percent * duration);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 z-50">
      <div className="container mx-auto flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Volume2 className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-800">{title}</span>
        </div>
        
        <div className="flex-1 flex items-center gap-3">
          <span className="text-sm text-gray-600 min-w-[40px]">
            {formatTime(currentTime)}
          </span>
          
          <div 
            className="flex-1 bg-gray-200 rounded-full h-2 cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="bg-[#002FA7] h-2 rounded-full transition-all duration-100"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          
          <span className="text-sm text-gray-600 min-w-[40px]">
            {formatTime(duration)}
          </span>
        </div>
        
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const AudioCard = ({ title, description, audioFile, children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setShowProgress(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Stop audio when component unmounts (navigation away)
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
      setShowProgress(true);
    }
  };

  const handleSeek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const closeProgress = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setShowProgress(false);
    setCurrentTime(0);
  };

  return (
    <>
      <Card className="hover-scale relative">
        {audioFile && (
          <>
            <button
              onClick={togglePlayPause}
              className="absolute top-4 right-4 w-10 h-10 bg-[#001F3F] hover:bg-[#002FA7] text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-sm z-10"
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            
            <audio ref={audioRef} preload="metadata">
              <source src={audioFile} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </>
        )}
        
        <CardHeader className={audioFile ? "pr-16" : ""}>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>

      {showProgress && (
        <AudioProgressBar
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          onClose={closeProgress}
          title={title}
        />
      )}
    </>
  );
};

export default function Library() {
  useEffect(() => setPageSEO("Vault – Education Library", "Short videos and interactive explainers on governance, conflict, and succession."), []);

  const topics = ["Succession", "Family business", "Resolving conflict", "Caregiving", "Inheritance", "Meetings 101"];

  return (
    <section className="container mx-auto py-12 md:py-16">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold">Education Library</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">On-demand content designed for busy families. Filter by topic, watch short videos, and try interactive explainers.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => (
          <AudioCard 
            key={t} 
            title={t}
            description="5–7 min videos plus an interactive explainer."
            audioFile={t === "Resolving conflict" ? "/Conflict.mp3" : null}
          >
            <button className="story-link">Start learning</button>
          </AudioCard>
        ))}
      </div>
    </section>
  );
}