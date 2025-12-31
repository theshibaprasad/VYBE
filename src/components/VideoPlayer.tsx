'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import {
    AlertTriangle,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    Settings,
    Radio
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

// Define strict types for managing quality
interface VideoPlayerProps {
    src: string;
    type?: string;
    poster?: string;
    className?: string;
}

interface QualityLevel {
    id: string; // Will store 'height' as ID to group duplicates
    height: number;
    bitrate: number;
}

interface VHSRepresentation {
    height: number;
    bandwidth: number;
    enabled: (state: boolean) => void;
}

export default function VideoPlayer({ src, type, poster, className }: VideoPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<Player | null>(null);
    const retryCountRef = useRef(0);
    const controlTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(false);

    // --- UI State ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    // --- Feature State ---
    const [error, setError] = useState<{ title: string, message: string } | null>(null);
    const [prevSrc, setPrevSrc] = useState(src);
    const [qualities, setQualities] = useState<QualityLevel[]>([]);
    const [currentQuality, setCurrentQuality] = useState<string>('auto');
    const [isLiveEdge, setIsLiveEdge] = useState(true);
    const [showQualityMenu, setShowQualityMenu] = useState(false);

    // Reset logic on source change
    useEffect(() => {
        retryCountRef.current = 0;
    }, [src]);

    if (src !== prevSrc) {
        setPrevSrc(src);
        setError(null);
        setIsPlaying(false);
    }

    // --- Control Visibility Logic ---
    const handleMouseMove = useCallback(() => {
        if (!isMountedRef.current) return;
        // Disable mousemove triggering on mobile to prevent accidental showing
        if (window.innerWidth < 768) return;

        setShowControls(true);
        if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
        if (isPlaying) {
            controlTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current) setShowControls(false);
            }, 5000);
        }
    }, [isPlaying]);

    // Clean up timeout on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
        };
    }, []);

    // --- Fullscreen Listener (Global) ---
    useEffect(() => {
        const handleFullscreenChange = () => {
            // Check if OUR container is the one in fullscreen
            const isContainerFullscreen = document.fullscreenElement === containerRef.current;
            if (isMountedRef.current) setIsFullscreen(isContainerFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Safari legacy
        document.addEventListener('mozfullscreenchange', handleFullscreenChange); // Firefox legacy
        document.addEventListener('MSFullscreenChange', handleFullscreenChange); // IE legacy

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    // --- Helper for safe playing ---
    const safePlay = useCallback((player: Player) => {
        const playPromise = player.play();
        if (playPromise !== undefined) {
            playPromise.catch((err) => {
                // Silently ignore AbortError (e.g. interruption by pause/load)
                if (err.name === 'AbortError') return;
                console.warn("Autoplay/Play prevented:", err);
            });
        }
    }, []);

    // --- Actions (Defined early for usage in effects) ---
    const togglePlay = useCallback(() => {
        const player = playerRef.current;
        if (!player) return;
        if (player.paused()) {
            safePlay(player);
        } else {
            player.pause();
        }
    }, [safePlay]);

    // --- Keyboard & Click Interactions ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle if no input is focused
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

            if (e.code === 'Space') {
                e.preventDefault(); // Prevent scroll
                togglePlay();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay]);

    // --- Player Lifecycle ---
    useEffect(() => {
        if (!playerRef.current) {
            const videoElement = document.createElement("video-js");
            videoElement.classList.add('vjs-big-play-centered');

            videoRef.current?.appendChild(videoElement);

            // Determine type if not provided
            let sourceType = type || 'application/x-mpegURL';
            if (!type && src) {
                if (src.includes('.mp4')) sourceType = 'video/mp4';
                else if (src.includes('.webm')) sourceType = 'video/webm';
            }

            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

            playerRef.current = videojs(videoElement, {
                autoplay: true,
                controls: false, // We use custom controls
                responsive: true,
                fill: true, // Use fill instead of fluid to fit container exactly (fixes fullscreen padding)
                poster: poster,
                sources: [{
                    src: src,
                    type: sourceType
                }],
                html5: {
                    vhs: {
                        overrideNative: !isSafari,
                        enableLowInitialPlaylist: true,
                        smoothQualityChange: true
                    },
                    nativeAudioTracks: false,
                    nativeVideoTracks: false
                },
                errorDisplay: false
            }, () => {
                videojs.log('player is ready');
            });

            const player = playerRef.current;

            // --- Event Listeners with Safe State Updates ---
            player.on('play', () => {
                if (!isMountedRef.current) return;
                setIsPlaying(true);
                // Auto-hide controls when playing starts
                if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
                controlTimeoutRef.current = setTimeout(() => {
                    if (isMountedRef.current) setShowControls(false);
                }, 5000);
            });

            player.on('pause', () => {
                if (!isMountedRef.current) return;
                setIsPlaying(false);
                setShowControls(true); // Always show controls when paused
                if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
            });

            player.on('volumechange', () => {
                if (!isMountedRef.current) return;
                const vol = player.volume();
                if (typeof vol === 'number') {
                    setVolume(vol);
                }
                setIsMuted(!!player.muted());
            });

            // Quality Level Detection
            player.on('loadedmetadata', () => {
                if (!isMountedRef.current) return;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const vhs = (player.tech() as any).vhs;
                if (vhs && vhs.representations) {
                    const levels = vhs.representations();
                    if (levels && levels.length > 0) {
                        // Deduplicate by height using a Map
                        const uniqueMap = new Map<number, VHSRepresentation>();

                        // We iterate to find unique heights. 
                        levels.forEach((lvl: VHSRepresentation) => {
                            if (lvl.height && !uniqueMap.has(lvl.height)) {
                                uniqueMap.set(lvl.height, lvl);
                            }
                        });

                        const mapped = Array.from(uniqueMap.values()).map((lvl) => ({
                            id: lvl.height.toString(), // Use HEIGHT as the ID
                            height: lvl.height,
                            bitrate: lvl.bandwidth
                        }));

                        // Sort ASCENDING (Low -> High)
                        mapped.sort((a, b) => a.height - b.height);
                        setQualities(mapped);
                    }
                }
            });

            // Live Edge Detection
            player.on('timeupdate', () => {
                if (!isMountedRef.current) return;
                if (!player || player.isDisposed()) return;

                try {
                    const duration = player.duration();
                    if (duration === undefined || isNaN(duration)) return;
                } catch (e) {
                    return;
                }

                const seekable = player.seekable();
                if (seekable && seekable.length > 0) {
                    const liveEdge = seekable.end(seekable.length - 1);
                    const current = player.currentTime();
                    if (typeof liveEdge === 'number' && typeof current === 'number') {
                        setIsLiveEdge(liveEdge - current < 15);
                    }
                }
            });

            // Reset retries when playback succeeds
            player.on('playing', () => {
                retryCountRef.current = 0;
                if (isMountedRef.current && error) setError(null);
            });

            // Error Handling Strategy
            player.on('error', () => {
                if (!isMountedRef.current) return;
                const err = player.error();
                const code = err?.code;
                console.warn(`VideoJS Error Code: ${code}`);

                if (!player.currentSrc()) return; // Check currentSrc instead of src()

                if ((code === 3 || code === 4 || code === 2) && retryCountRef.current < 3) {
                    retryCountRef.current += 1;
                    console.log(`Auto-retrying... Attempt ${retryCountRef.current}`);
                    setTimeout(() => {
                        if (player && isMountedRef.current && !player.isDisposed()) {
                            player.error(undefined);
                            // Smart Retry Strategy (Type Swap + Proxy)
                            let retrySrc = src;
                            let retryType = type || 'application/x-mpegURL';

                            // If explicit type wasn't provided, ensure we have a fallback
                            if (!type && src) {
                                if (src.includes('.mp4')) retryType = 'video/mp4';
                                else if (src.includes('.webm')) retryType = 'video/webm';
                            }

                            // 1. PROXY FALLBACK: If we've retried twice already, try the proxy.
                            if (retryCountRef.current >= 2) {
                                console.log('[Smart Retry] Attempting Proxy Bypass...');
                                const proxyUrl = `/api/proxy?url=${encodeURIComponent(src)}`;
                                retrySrc = proxyUrl;
                                // Ideally we keep the guessed type, often HLS works best proxied.
                            }
                            // 2. TYPE SWAP: If early retry (Code 4), swap types.
                            else if (code === 4) {
                                const currentType = player.currentType();
                                if (currentType === 'application/x-mpegURL') {
                                    retryType = 'video/mp4';
                                } else {
                                    retryType = 'application/x-mpegURL';
                                }
                                console.log(`[Smart Retry] Switching type to ${retryType}`);
                            }

                            // Only reload if something changed to avoid endless loop of same-src
                            if (retrySrc !== player.currentSrc() || retryType !== player.currentType() || retryCountRef.current >= 2) {
                                player.src({ src: retrySrc, type: retryType });
                                player.load();
                                safePlay(player);
                            } else {
                                // Force reload even if src "looks" same (internal videojs state might need kick)
                                player.src({ src: retrySrc, type: retryType });
                                player.load();
                                safePlay(player);
                            }
                        }
                    }, 1500);
                    return;
                }

                const message = 'Stream Offline';
                let subMessage = 'Please try another channel.';
                if (code === 4) subMessage = 'Source unavailable or format not supported.';
                else if (code === 3) subMessage = 'Playback decode error. Stream may be corrupt.';
                else if (code === 2) subMessage = 'Network connection failed.';

                setError({ title: message, message: subMessage });
            });

        } else {
            // Update source if player already exists
            const player = playerRef.current;

            // Determine type if not provided
            let sourceType = type || 'application/x-mpegURL';
            if (!type && src) {
                if (src.includes('.mp4')) sourceType = 'video/mp4';
                else if (src.includes('.webm')) sourceType = 'video/webm';
            }

            // Clean reset when props change
            player.reset();
            player.src({ src, type: sourceType });
            player.autoplay(true);
            retryCountRef.current = 0;
            if (isMountedRef.current) setError(null); // Clear error on new src
        }
    }, [src, type, poster, videoRef, safePlay]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, []);

    // --- Helper for Click ---
    const handleContainerClick = () => {
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            // Mobile: Toggle Controls visibility
            if (showControls) {
                // If showing, hide immediately
                setShowControls(false);
                if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
            } else {
                // If hidden, show and set 8s timer
                setShowControls(true);
                if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
                if (isPlaying) {
                    controlTimeoutRef.current = setTimeout(() => {
                        if (isMountedRef.current) setShowControls(false);
                    }, 5000);
                }
            }
        } else {
            // Desktop: Toggle Play/Pause
            togglePlay();
        }
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            try {
                await containerRef.current?.requestFullscreen();
                // Attempt to lock orientation to landscape on mobile
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (screen.orientation && (screen.orientation as any).lock) {
                    try {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        await (screen.orientation as any).lock('landscape');
                    } catch (e) {
                        // Ignore errors (not supported on desktop/some devices)
                        console.log("Orientation lock not supported or failed:", e);
                    }
                }
            } catch (err) {
                console.error("Error attempting to enable fullscreen:", err);
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
                // Unlock orientation
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (screen.orientation && (screen.orientation as any).unlock) {
                    try {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (screen.orientation as any).unlock();
                    } catch (e) {
                        // Ignore
                    }
                }
            }
        }
    };

    const toggleMute = () => {
        const player = playerRef.current;
        if (!player) return;
        player.muted(!player.muted());
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVol = parseFloat(e.target.value);
        const player = playerRef.current;
        if (player) player.volume(newVol);
    };

    const { settings } = useStore();

    const handleQualityChange = useCallback((levelId: string) => {
        const player = playerRef.current;
        setCurrentQuality(levelId);
        setShowQualityMenu(false);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vhs = (player?.tech() as any)?.vhs;
        if (vhs?.representations) {
            const levels = vhs.representations();
            if (levelId === 'auto') {
                levels.forEach((lvl: VHSRepresentation) => lvl.enabled(true));
            } else {
                // Enable ALL representations that match the selected height
                levels.forEach((lvl: VHSRepresentation) => {
                    lvl.enabled(lvl.height.toString() === levelId);
                });
            }
        }
    }, []);

    // Data Saver Enforcer
    useEffect(() => {
        if (qualities.length === 0) return;

        if (settings.dataSaver) {
            // Find highest quality that is <= 480p (Good balance for data saver)
            // Qualities are sorted ASC (low to high)
            // 360, 480, 720, 1080
            // We want 480. 
            // Reversed find or filter + pop would work. 
            const saverQuality = [...qualities].reverse().find(q => q.height <= 480) || qualities[0];

            if (saverQuality && currentQuality !== saverQuality.id) {
                console.log(`[Data Saver] Enforcing quality: ${saverQuality.height}p`);
                handleQualityChange(saverQuality.id);
            }
        }
    }, [settings.dataSaver, qualities, handleQualityChange, currentQuality]);

    const jumpToLive = () => {
        const player = playerRef.current;
        if (player) {
            const seekable = player.seekable();
            if (seekable.length > 0) {
                const liveEdge = seekable.end(seekable.length - 1);
                player.currentTime(liveEdge);
                safePlay(player);
            }
        }
    };

    const handleRetry = () => {
        const player = playerRef.current;
        if (player) {
            setError(null);
            retryCountRef.current = 0;
            player.error(undefined);

            // Re-determine source type for retry
            let retryType = type || 'application/x-mpegURL';
            if (!type && src) {
                if (src.includes('.mp4')) retryType = 'video/mp4';
                else if (src.includes('.webm')) retryType = 'video/webm';
            }

            player.src({ src, type: retryType });
            player.load();
            safePlay(player);
        }
    };

    // --- Helper for Mouse Leave ---
    const handleMouseLeave = useCallback(() => {
        // Disable mouse leave on mobile to prevent premature hiding
        if (window.innerWidth < 768) return;

        if (isPlaying) {
            setShowControls(false);
        }
    }, [isPlaying]);

    return (
        <div
            ref={containerRef}
            className={cn(className, "relative group overflow-hidden bg-black shadow-2xl", !isFullscreen && "rounded-xl")}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleContainerClick}
        >
            <div data-vjs-player className="w-full h-full pointer-events-none">
                <div ref={videoRef} className="w-full h-full" />
            </div>

            {/* --- Custom Controls Overlay --- */}
            <div className={cn(
                "absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 pointer-events-none",
                showControls ? "opacity-100" : "opacity-0"
            )} />

            {/* Controls Bar */}
            <div
                className={cn(
                    "absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 z-40 flex items-center gap-4",
                    showControls ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Play/Pause */}
                <button
                    onClick={togglePlay}
                    className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"
                    title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                >
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2 group/vol">
                    <button onClick={toggleMute} className="p-2 hover:bg-white/20 rounded-full text-white transition-colors" title="Mute/Unmute">
                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <div className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </div>

                {/* LIVE Badge / Button */}
                <button
                    onClick={jumpToLive}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ml-2",
                        isLiveEdge
                            ? "text-red-500 cursor-default select-none"
                            : "bg-white/20 hover:bg-white/30 text-gray-200 cursor-pointer"
                    )}
                    title="Jump to Live"
                >
                    <div className={cn("w-2 h-2 rounded-full", isLiveEdge ? "bg-red-500 animate-pulse" : "bg-gray-400")} />
                    {isLiveEdge ? 'LIVE' : 'GO LIVE'}
                </button>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Quality Selector */}
                {qualities.length > 0 && (
                    <div className="relative">
                        <button
                            onClick={() => setShowQualityMenu(!showQualityMenu)}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-white/20 rounded-lg text-white transition-colors text-sm font-medium"
                            title="Quality Settings"
                        >
                            <Settings className="w-4 h-4" />
                            <span>{currentQuality === 'auto' ? 'Auto' : `${qualities.find(q => q.id === currentQuality)?.height}p`}</span>
                        </button>

                        {/* Quality Menu Dropdown */}
                        {showQualityMenu && (
                            <div className="absolute bottom-full right-0 mb-2 w-40 bg-[#191f27] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-bottom-2">
                                <button
                                    onClick={() => handleQualityChange('auto')}
                                    className={cn(
                                        "w-full px-4 py-3 text-left text-xs font-medium hover:bg-white/5 transition-colors flex items-center gap-3",
                                        currentQuality === 'auto' ? "text-blue-400" : "text-gray-300"
                                    )}
                                >
                                    <Radio className="w-3 h-3" />
                                    <span>Auto (Recommended)</span>
                                </button>
                                <div className="h-px bg-white/10 my-1 mx-2" />
                                {qualities.map(q => (
                                    <button
                                        key={q.id}
                                        onClick={() => handleQualityChange(q.id)}
                                        className={cn(
                                            "w-full px-4 py-2.5 text-left text-xs font-medium hover:bg-white/5 transition-colors flex justify-between items-center group",
                                            currentQuality === q.id ? "text-blue-400" : "text-gray-300"
                                        )}
                                    >
                                        <span className="group-hover:translate-x-1 transition-transform">{q.height}p</span>
                                        {currentQuality === q.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Fullscreen */}
                <button
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
            </div>

            {/* --- Error Overlay --- */}
            {error && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-6 text-center animate-in fade-in">
                    <AlertTriangle className="w-16 h-16 text-red-500 mb-6 animate-bounce" />
                    <h3 className="text-2xl font-bold text-white mb-2">{error.title}</h3>
                    <p className="text-gray-400 max-w-sm mb-8">{error.message}</p>
                    <div className="flex gap-4">
                        <button
                            onClick={handleRetry}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2"
                        >
                            Retry Stream
                        </button>
                    </div>
                </div>
            )}

            <style jsx global>{`
                /* Hide native Video.js controls */
                .video-js {
                    width: 100%;
                    height: 100%;
                }
                .video-js .vjs-tech {
                    object-fit: contain;
                    width: 100%;
                    height: 100%;
                }
                .vjs-big-play-button {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
