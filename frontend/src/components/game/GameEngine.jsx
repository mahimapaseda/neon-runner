import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Box, OrbitControls, Sphere, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

import useAuthStore from '../../store/authStore';
import useGameStore from '../../store/gameStore';
import { submitScore, fetchHeartPuzzle } from '../../services/apiClient';
import audioManager from '../../services/audioManager';

const LORE_FRAGMENTS = [
    "LOG #402: The architects hid the master key in sector 7...",
    "LOG #119: The rogue nodes are adapting. They speak in primes.",
    "LOG #883: I left a backdoor in the authentication matrix...",
    "LOG #999: They think they deleted us. We are in the walls.",
    "LOG #001: First there was light. Then, there was code."
];

const HACKER_TAUNTS = [
    "UNAUTHORIZED ACCESS DETECTED. PURGING.",
    "YOUR SIGNATURE IS OBSOLETE. TERMINATING.",
    "FIREWALL DEPLOYED. CALCULATING YOUR DEMISE.",
    "YOU CANNOT OUTSMART THE SYSTEM.",
    "I WILL ERASE YOU FROM THE LOGS."
];

const TransmissionTerminal = ({ onComplete }) => {
    const text = ">> INCOMING SECURE TRANSMISSION...\n>> SENDER: OVERSEER_AI\n>> CLASSIFICATION: BLACK\n\nAGENT. WE HAVE LOCATED THE CORRUPTED SECTOR.\nROGUE SECURITY NODES ARE GUARDING FRAGMENTS OF THE SOURCE CODE.\nYOUR MISSION:\n1. INFILTRATE THE GRID.\n2. ELIMINATE THE NODES BY OVERRIDING THEIR FIREWALL LOGIC.\n3. RECOVER ALL STOLEN DATA FRAGMENTS.\n\nFAILURE IS NOT AN OPTION. GOOD LUCK.";
    const [display, setDisplay] = useState('');
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setDisplay(text.substring(0, i));
            i++;
            if (i > text.length) {
                clearInterval(interval);
                setShowButton(true);
            }
        }, 15); // Faster, more professional speed
        return () => clearInterval(interval);
    }, []);

    const handleSkip = () => {
        setDisplay(text);
        setShowButton(true);
    };

    return (
        <div style={{
            position: 'absolute', inset: 0, zIndex: 50, backgroundColor: 'rgba(5,5,8,0.98)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', fontFamily: 'Fira Code', backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.03) 0%, transparent 70%)'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', height: '80%', padding: '3rem', display: 'flex', flexDirection: 'column' }}>
                <div className="panel-corner corner-tl" />
                <div className="panel-corner corner-br" />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(0, 240, 255, 0.2)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '2px' }}>VIRTUAL_SESSION_ESTABLISHED</span>
                        <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.5rem' }}>SECURE_CHANNEL</h2>
                    </div>
                    {!showButton && (
                        <button
                            onClick={handleSkip}
                            className="btn-secondary"
                            style={{ fontSize: '0.7rem', padding: '0.5rem 1rem' }}
                        >
                            BYPASS_SEQUENCE
                        </button>
                    )}
                </div>

                <div style={{ flex: 1, whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--terminal-green)', overflowY: 'auto' }}>
                    {display}
                    <span className="cursor-blink" style={{ background: 'var(--terminal-green)', color: '#000', padding: '0 4px' }}> </span>
                </div>

                {showButton && (
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-start', animation: 'crtTurnOn 0.4s ease-out' }}>
                        <button
                            className="btn-primary"
                            onClick={onComplete}
                            style={{ padding: '1rem 3rem' }}
                        >
                            [ INITIATE_DROP ]
                        </button>
                    </div>
                )}
            </div>
            <style>{`.cursor-blink { animation: blink 1s step-end infinite; } @keyframes blink { 50% { opacity: 0; } }`}</style>
        </div>
    );
};

// --- Constants & Global Data ---
const TILE_SIZE = 2; // 3D units

// --- Level Data & Generation ---
const LEVEL_MAPS = [
    [ // Level 1 - The Corridor
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    [ // Level 2 - The Square
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    [ // Level 3 - The Labyrinth
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
];

const generateLevelData = (level, hero) => {
    const mapIndex = (level - 1) % LEVEL_MAPS.length;
    const currentMap = LEVEL_MAPS[mapIndex];

    // Scale difficulty
    const nodeCount = 3 + level * 2;
    const baseHealth = 3 + Math.floor(level / 2);
    const baseSpeed = 2.0 + level * 0.5;

    const nodes = [];
    const floorTiles = [];
    for (let r = 0; r < currentMap.length; r++) {
        for (let c = 0; c < currentMap[0].length; c++) {
            if (currentMap[r][c] === 0) floorTiles.push({ r, c });
        }
    }

    // Spawn Player at first floor tile
    const playerStart = floorTiles[0];

    // Spawn Nodes
    for (let i = 0; i < nodeCount; i++) {
        const tile = floorTiles[Math.floor(Math.random() * (floorTiles.length - 1)) + 1];
        nodes.push({
            id: Date.now() + i,
            x: tile.c * TILE_SIZE,
            z: tile.r * TILE_SIZE,
            health: baseHealth,
            moveSpeed: baseSpeed * (0.8 + Math.random() * 0.4),
            active: true,
            roamTarget: { x: tile.c * TILE_SIZE, z: tile.r * TILE_SIZE },
            lastHit: 0
        });
    }

    // Spawn Fragments
    const fragments = [];
    for (let i = 0; i < 3; i++) {
        const tile = floorTiles[Math.floor(Math.random() * floorTiles.length)];
        fragments.push({ id: Date.now() + 100 + i, x: tile.c * TILE_SIZE, z: tile.r * TILE_SIZE, active: true });
    }

    // Spawn Hearts (Restore Health)
    const hearts = [];
    const heartCount = Math.random() > 0.5 ? 2 : 1; // 1-2 hearts
    for (let i = 0; i < heartCount; i++) {
        const tile = floorTiles[Math.floor(Math.random() * floorTiles.length)];
        hearts.push({ id: Date.now() + 200 + i, x: tile.c * TILE_SIZE, z: tile.r * TILE_SIZE, active: true });
    }

    return {
        map: currentMap,
        nodes,
        fragments,
        hearts,
        player: { x: playerStart.c * TILE_SIZE, z: playerStart.r * TILE_SIZE }
    };
};

// Reusable custom materials with PBR refinements
const floorMaterial = new THREE.MeshStandardMaterial({
    color: '#020205',
    roughness: 0.05,
    metalness: 0.95,
    transparent: true,
    opacity: 0.95
});
const wallMaterial = new THREE.MeshStandardMaterial({
    color: '#00f0ff',
    emissive: '#00f0ff',
    emissiveIntensity: 2.5, // High intensity for Bloom
    wireframe: true,
    transparent: true,
    opacity: 0.4
});
const nodeMaterial = new THREE.MeshStandardMaterial({
    color: '#ff003c',
    emissive: '#ff003c',
    emissiveIntensity: 5 // Nuclear glow
});
const fragmentMaterial = new THREE.MeshStandardMaterial({
    color: '#39ff14',
    emissive: '#39ff14',
    emissiveIntensity: 3
});
const heartMaterial = new THREE.MeshStandardMaterial({
    color: '#ff003c',
    emissive: '#ff003c',
    emissiveIntensity: 3
});

// AABB 2D Collision logic translated to 3D (X/Z plane)
const checkCollision = (rect1, rect2) => {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.z < rect2.z + rect2.depth &&
        rect1.z + rect1.depth > rect2.z
    );
};

// --- Radar Component ---
const Radar = ({ playerPos, nodes, fragments, hearts }) => {
    const radarSize = 140; // Slightly larger for detail
    const mapScale = 4.5;

    return (
        <div style={{
            position: 'absolute', bottom: '30px', right: '30px', width: radarSize, height: radarSize,
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.05) 0%, rgba(0,0,0,0.8) 100%)',
            border: '2px solid rgba(0, 240, 255, 0.3)', borderRadius: '50%',
            overflow: 'hidden', zIndex: 10, boxShadow: '0 0 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,240,255,0.1)',
            pointerEvents: 'none', transform: 'perspective(500px) rotateY(-10deg)'
        }}>
            {/* Compass Rings */}
            <div style={{ position: 'absolute', inset: '10%', border: '1px solid rgba(0,240,255,0.05)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', inset: '30%', border: '1px solid rgba(0,240,255,0.05)', borderRadius: '50%' }} />

            {/* Axis Lines */}
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,240,255,0.1)' }} />
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0,240,255,0.1)' }} />

            {/* Scanline */}
            <div className="radar-scanline" />

            {/* Indicators */}
            <div style={{ position: 'absolute', left: '50%', top: '50%', width: '8px', height: '8px', background: '#fff', borderRadius: '50%', transform: 'translate(-50%, -50%)', boxShadow: '0 0 8px #fff', zIndex: 5 }} />

            {nodes.map(n => n.active && (
                <div key={`radar-node-${n.id}`} style={{
                    position: 'absolute', left: `calc(50% + ${(n.x - playerPos.x) * mapScale}px)`, top: `calc(50% + ${(n.z - playerPos.z) * mapScale}px)`,
                    width: '6px', height: '6px', background: 'var(--secondary)', borderRadius: '50%', transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 10px var(--secondary)', zIndex: 4
                }}>
                    <div className="blip-node" style={{ position: 'absolute', inset: 0, border: '1px solid var(--secondary)', borderRadius: '50%' }} />
                </div>
            ))}

            {fragments.map(f => f.active && (
                <div key={`radar-frag-${f.id}`} style={{
                    position: 'absolute', left: `calc(50% + ${(f.x - playerPos.x) * mapScale}px)`, top: `calc(50% + ${(f.z - playerPos.z) * mapScale}px)`,
                    width: '5px', height: '5px', background: 'var(--terminal-green)', borderRadius: '2px', transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 5px var(--terminal-green)', zIndex: 3
                }} />
            ))}

            {hearts?.map(h => h.active && (
                <div key={`radar-heart-${h.id}`} style={{
                    position: 'absolute', left: `calc(50% + ${(h.x - playerPos.x) * mapScale}px)`, top: `calc(50% + ${(h.z - playerPos.z) * mapScale}px)`,
                    width: '10px', height: '10px', transform: 'translate(-50%, -50%)',
                    zIndex: 3
                }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--secondary)" style={{ filter: 'drop-shadow(0 0 3px var(--secondary))' }}>
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </div>
            ))}

            {/* Coordinates Reader */}
            <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, textAlign: 'center', fontSize: '0.6rem', color: 'rgba(0,240,255,0.4)', fontFamily: 'Fira Code' }}>
                POS: {Math.round(playerPos.x)},{Math.round(playerPos.z)}
            </div>
        </div>
    );
};


// --- Top HUD Bar Component ---
const TopHUD = ({ experience, puzzles, health, level = 1, totalPuzzles = 6, onExit }) => {
    return (
        <div className="hud-visor" style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '120px',
            zIndex: 10, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between',
            fontFamily: 'Orbitron', pointerEvents: 'none'
        }}>
            {/* Left: Mission & Experience */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '4px' }}>SECTOR_ACCESS</div>
                    <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>NEON_RUNNER_LVL_{level}</div>
                </div>
                <div style={{ padding: '0.5rem 1rem', borderLeft: '3px solid var(--primary)', background: 'linear-gradient(90deg, rgba(0,240,255,0.1), transparent)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '2px' }}>CORTEX_SYNC</div>
                    <div style={{ color: 'var(--primary)', fontSize: '1.4rem', fontWeight: '900' }}>{Math.floor(experience)} <span style={{ fontSize: '0.8rem' }}>EXP</span></div>
                </div>
            </div>

            {/* Center: Mission Progress */}
            <div style={{ position: 'absolute', left: '50%', top: '1.5rem', transform: 'translateX(-50%)', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '4px', marginBottom: '4px' }}>OBJECTIVE_STATUS</div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {Array.from({ length: totalPuzzles || 1 }).map((_, i) => (
                        <div key={i} style={{
                            width: '30px', height: '4px',
                            background: i < puzzles ? 'var(--primary)' : 'rgba(0,240,255,0.1)',
                            boxShadow: i < puzzles ? '0 0 10px var(--primary)' : 'none',
                            transition: 'all 0.5s ease'
                        }} />
                    ))}
                </div>
                <div style={{ marginTop: '5px', color: '#ffd700', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '2px' }}>
                    {puzzles} / {totalPuzzles} NODES_DECRYPTED
                </div>
            </div>

            {/* Right: Integrity & Exit */}
            <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '2px' }}>SYS_INTEGRITY</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                                key={i}
                                width="18" height="18"
                                viewBox="0 0 24 24"
                                fill={i < health ? 'var(--secondary)' : 'rgba(255,0,60,0.1)'}
                                style={{
                                    filter: i < health ? 'drop-shadow(0 0 5px var(--secondary))' : 'none',
                                    transition: 'all 0.3s ease',
                                    animation: (health <= 1 && i < health) ? 'pulseDanger 1s infinite' : 'none'
                                }}
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        ))}
                    </div>
                </div>
                {onExit && (
                    <button
                        className="btn-secondary"
                        onClick={onExit}
                        style={{ pointerEvents: 'auto', fontSize: '0.7rem', padding: '0.5rem 1rem', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                        ABORT_PROCESS
                    </button>
                )}
            </div>

            {/* Visor Scanline Effect */}
            <div className="scanline-effect" style={{ opacity: 0.2 }} />
        </div>
    );
};

// --- Heart 3D Component ---
const Heart3D = ({ position, color = "#ff003c" }) => {
    const meshRef = useRef();
    const heartShape = useMemo(() => {
        const shape = new THREE.Shape();
        const x = 0, y = 0;
        shape.moveTo(x, y + 0.5);
        shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.5, y + 1.2, x, y + 1.2);
        shape.bezierCurveTo(x - 0.5, y + 1.2, x - 0.5, y + 0.5, x, y + 0.5);
        return shape;
    }, []);

    // Better path for a heart
    const heartPath = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0, -0.4);
        shape.bezierCurveTo(0, -0.4, -0.5, 0.1, -0.5, 0.4);
        shape.bezierCurveTo(-0.5, 0.8, 0, 0.8, 0, 0.4);
        shape.bezierCurveTo(0, 0.8, 0.5, 0.8, 0.5, 0.4);
        shape.bezierCurveTo(0.5, 0.1, 0, -0.4, 0, -0.4);
        return shape;
    }, []);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 2;
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        }
    });

    return (
        <mesh position={position} ref={meshRef}>
            <extrudeGeometry args={[heartPath, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1 }]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
        </mesh>
    );
};

const Cityscape = () => {
    const buildingsRef = useRef([]);

    useEffect(() => {
        const B = [];
        for (let i = 0; i < 40; i++) {
            const height = 5 + Math.random() * 15;
            const x = (Math.random() - 0.5) * 60;
            const z = -20 - Math.random() * 40; // Deep background
            B.push({ id: i, x, z, h: height, w: 1 + Math.random() * 3 });
        }
        buildingsRef.current = B;
    }, []);

    const [buildings, setBuildings] = useState([]);
    useEffect(() => {
        setBuildings(buildingsRef.current);
    }, []);

    return (
        <group>
            {buildings.map(b => (
                <mesh key={b.id} position={[b.x, b.h / 2, b.z]}>
                    <boxGeometry args={[b.w, b.h, b.w]} />
                    <meshStandardMaterial
                        color="#050515"
                        emissive="#00f0ff"
                        emissiveIntensity={0.1}
                        wireframe
                        transparent
                        opacity={0.1}
                    />
                </mesh>
            ))}
        </group>
    );
};

const DigitalRain = () => {
    const pointsRef = useRef([]);

    useEffect(() => {
        const P = [];
        for (let i = 0; i < 200; i++) {
            P.push({
                pos: [(Math.random() - 0.5) * 40, Math.random() * 20, (Math.random() - 0.5) * 40],
                speed: 0.1 + Math.random() * 0.2
            });
        }
        pointsRef.current = P;
    }, []);

    const rainRef = useRef();
    useFrame(() => {
        if (!rainRef.current || pointsRef.current.length === 0) return;
        rainRef.current.children.forEach((child, i) => {
            child.position.y -= pointsRef.current[i].speed;
            if (child.position.y < 0) child.position.y = 20;
        });
    });

    const [points, setPoints] = useState([]);
    useEffect(() => {
        setPoints(pointsRef.current);
    }, []);

    return (
        <group ref={rainRef}>
            {points.map((p, i) => (
                <mesh key={i} position={p.pos}>
                    <boxGeometry args={[0.02, 0.4, 0.02]} />
                    <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2} transparent opacity={0.6} />
                </mesh>
            ))}
        </group>
    );
};

const HoloAd = ({ position, color = "#00f0ff" }) => {
    const meshRef = useRef();
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 10) * 0.1;
        }
    });

    return (
        <mesh position={position} ref={meshRef}>
            <planeGeometry args={[4, 2]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={2}
                transparent
                side={THREE.DoubleSide}
                opacity={0.4}
            />
        </mesh>
    );
};

// --- Humanoid Player Component ---
const HumanoidPlayer = React.forwardRef((props, ref) => {
    // Suit PBR Material
    const suitMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#111',
        roughness: 0.1,
        metalness: 0.9,
        emissive: '#00f0ff',
        emissiveIntensity: 0.05
    }), []);

    // Holo Head Material
    const headMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#00f0ff',
        emissive: '#00f0ff',
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.8,
        wireframe: true
    }), []);

    return (
        <group ref={ref}>
            {/* Torso */}
            <mesh position={[0, 0.6, 0]}>
                <capsuleGeometry args={[0.2, 0.4, 4, 8]} />
                <primitive object={suitMaterial} attach="material" />
            </mesh>
            {/* Head */}
            <mesh position={[0, 1.1, 0]}>
                <sphereGeometry args={[0.12, 16, 16]} />
                <primitive object={headMaterial} attach="material" />
            </mesh>
            {/* Left Arm */}
            <mesh position={[-0.3, 0.7, 0]} rotation={[0, 0, 0.2]}>
                <capsuleGeometry args={[0.06, 0.3, 4, 8]} />
                <primitive object={suitMaterial} attach="material" />
            </mesh>
            {/* Right Arm */}
            <mesh position={[0.3, 0.7, 0]} rotation={[0, 0, -0.2]}>
                <capsuleGeometry args={[0.06, 0.3, 4, 8]} />
                <primitive object={suitMaterial} attach="material" />
            </mesh>
            {/* Left Leg */}
            <mesh position={[-0.12, 0.2, 0]}>
                <capsuleGeometry args={[0.07, 0.3, 4, 8]} />
                <primitive object={suitMaterial} attach="material" />
            </mesh>
            {/* Right Leg */}
            <mesh position={[0.12, 0.2, 0]}>
                <capsuleGeometry args={[0.07, 0.3, 4, 8]} />
                <primitive object={suitMaterial} attach="material" />
            </mesh>

            {/* Persona Glow Aura */}
            <Sparkles count={10} scale={1} size={1} speed={0.2} color="#00f0ff" position={[0, 0.6, 0]} />
        </group>
    );
});

// --- Debris Component ---
const Debris = ({ position, color }) => {
    return (
        <mesh position={position}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.6} />
        </mesh>
    );
};

// --- Projectile Component ---
const Projectile = ({ position }) => {
    return (
        <mesh position={position}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#fff" emissive="#00f0ff" emissiveIntensity={5} />
        </mesh>
    );
};

// --- The 3D World Component ---
const World3D = ({ gameState, gameStateRef, gameMap, hero, onCollectLore, onHitPlayer, onHealPlayer, onEnemyDestroyed, onPuzzleTrigger }) => {
    const { camera, raycaster, mouse, scene } = useThree();
    const playerRef = useRef();
    const floorPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
    const aimPoint = useMemo(() => new THREE.Vector3(), []);
    // Setup initial geometry map instances
    const mapElements = useMemo(() => {
        const elements = [];
        for (let r = 0; r < gameMap.length; r++) {
            for (let c = 0; c < gameMap[0].length; c++) {
                const x = c * TILE_SIZE;
                const z = r * TILE_SIZE;

                if (gameMap[r][c] === 1) {
                    elements.push(
                        <Box key={`wall-${r}-${c}`} args={[TILE_SIZE, TILE_SIZE, TILE_SIZE]} position={[x, TILE_SIZE / 2, z]} material={wallMaterial} />
                    );
                } else {
                    elements.push(
                        <Box key={`floor-${r}-${c}`} args={[TILE_SIZE, 0.1, TILE_SIZE]} position={[x, 0, z]} material={floorMaterial} />
                    );
                }
            }
        }
        return elements;
    }, [gameMap]);

    // Keyboard & Mouse Tracking
    const keysDown = useRef({});
    useEffect(() => {
        const handleDown = (e) => keysDown.current[e.code] = true;
        const handleUp = (e) => keysDown.current[e.code] = false;
        const handleMouseDown = () => keysDown.current['Click'] = true;
        const handleMouseUp = () => keysDown.current['Click'] = false;

        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleUp);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    useFrame((state, delta) => {
        if (gameState !== 'EXPLORATION') return;
        const gState = gameStateRef.current;

        // Player Movement
        let dx = 0;
        let dz = 0;
        const moveAmt = gState.moveSpeed * delta;

        if (keysDown.current['ArrowUp'] || keysDown.current['KeyW']) dz -= moveAmt;
        if (keysDown.current['ArrowDown'] || keysDown.current['KeyS']) dz += moveAmt;
        if (keysDown.current['ArrowLeft'] || keysDown.current['KeyA']) dx -= moveAmt;
        if (keysDown.current['ArrowRight'] || keysDown.current['KeyD']) dx += moveAmt;

        // Update facing direction if moving
        if (dx !== 0 || dz !== 0) {
            const length = Math.sqrt(dx * dx + dz * dz);
            gState.player.facing = { x: dx / length, z: dz / length };
        }

        // Mouse Aiming Logic
        raycaster.setFromCamera(mouse, camera);
        if (raycaster.ray.intersectPlane(floorPlane, aimPoint)) {
            const ax = aimPoint.x - gState.player.x;
            const az = aimPoint.z - gState.player.z;
            const aLen = Math.sqrt(ax * ax + az * az);
            if (aLen > 0.1) {
                gState.player.facing = { x: ax / aLen, z: az / aLen };
            }
        }

        // Shooting mechanism
        if ((keysDown.current['Space'] || keysDown.current['Click']) && state.clock.elapsedTime - gState.player.lastShot > 0.25) {
            gState.player.lastShot = state.clock.elapsedTime;
            audioManager.playBeep(880); // Pew sound
            gState.projectiles.push({
                id: Date.now(),
                x: gState.player.x,
                z: gState.player.z,
                dx: gState.player.facing.x * 25, // Increased Bullet Speed
                dz: gState.player.facing.z * 25,
                active: true,
                life: 1.5 // Seconds
            });
            // Minor recoil shake
            gState.cameraShake = 0.1;
        }

        // Player Bounds logic (simple Box AABB on X/Z)
        const pSize = 0.8; // Reduced for smoother corridor navigation
        const newX = gState.player.x + dx;
        const newZ = gState.player.z + dz;

        let canMoveX = true;
        let canMoveY = true; // (Mapping to Z mechanically)

        // Tiles
        const tileX = Math.floor(gState.player.x / TILE_SIZE);
        const tileZ = Math.floor(gState.player.z / TILE_SIZE);

        for (let r = Math.max(0, tileZ - 1); r <= Math.min(gameMap.length - 1, tileZ + 1); r++) {
            for (let c = Math.max(0, tileX - 1); c <= Math.min(gameMap[0].length - 1, tileX + 1); c++) {
                if (gameMap[r][c] === 1) {
                    const wallRect = { x: c * TILE_SIZE - (TILE_SIZE / 2), z: r * TILE_SIZE - (TILE_SIZE / 2), width: TILE_SIZE, depth: TILE_SIZE };

                    const testPlayerX = { x: newX - (pSize / 2), z: gState.player.z - (pSize / 2), width: pSize, depth: pSize };
                    if (checkCollision(testPlayerX, wallRect)) canMoveX = false;

                    const testPlayerZ = { x: gState.player.x - (pSize / 2), z: newZ - (pSize / 2), width: pSize, depth: pSize };
                    if (checkCollision(testPlayerZ, wallRect)) canMoveY = false;
                }
            }
        }

        if (canMoveX) gState.player.x = newX;
        if (canMoveY) gState.player.z = newZ;

        // Ensure we don't fall off un-walled map edges
        const maxMapX = (gameMap[0].length - 1) * TILE_SIZE;
        const maxMapZ = (gameMap.length - 1) * TILE_SIZE;
        gState.player.x = Math.max(0, Math.min(gState.player.x, maxMapX));
        gState.player.z = Math.max(0, Math.min(gState.player.z, maxMapZ));

        // Update ThreeJS mesh position and rotation
        if (playerRef.current) {
            playerRef.current.position.set(gState.player.x, 0.5, gState.player.z);

            // Rotate player to face direction
            const angle = Math.atan2(gState.player.facing.x, gState.player.facing.z);
            playerRef.current.rotation.y = angle;

            // Hover animation & i-frames blink
            playerRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.1;

            // Blink if invulnerable
            if (state.clock.elapsedTime < gState.player.invulnUntil) {
                playerRef.current.visible = Math.floor(state.clock.elapsedTime * 10) % 2 === 0;
            } else {
                playerRef.current.visible = true;
            }
        }

        // Camera follow with Shake
        const shake = (gState.cameraShake || 0);
        const shakeX = (Math.random() - 0.5) * shake;
        const shakeZ = (Math.random() - 0.5) * shake;

        camera.position.set(gState.player.x + shakeX, 10, gState.player.z + 6 + shakeZ);
        camera.lookAt(gState.player.x, 1, gState.player.z);

        if (gState.cameraShake > 0) {
            gState.cameraShake *= 0.9; // Decay shake
            if (gState.cameraShake < 0.01) gState.cameraShake = 0;
        }

        // --- Stuck Recovery (Push-out) ---
        // If player is inside a wall, push them towards the nearest floor
        const currentTileX = Math.floor(gState.player.x / TILE_SIZE);
        const currentTileZ = Math.floor(gState.player.z / TILE_SIZE);

        if (gameMap[currentTileZ] && gameMap[currentTileZ][currentTileX] === 1) {
            // Find nearest floor tile in 3x3
            let bestX = gState.player.x;
            let bestZ = gState.player.z;
            let minDist = Infinity;

            for (let r = Math.max(0, currentTileZ - 1); r <= Math.min(gameMap.length - 1, currentTileZ + 1); r++) {
                for (let c = Math.max(0, currentTileX - 1); c <= Math.min(gameMap[0].length - 1, currentTileX + 1); c++) {
                    if (gameMap[r][c] === 0) {
                        const fx = c * TILE_SIZE;
                        const fz = r * TILE_SIZE;
                        const distToFloor = Math.sqrt(Math.pow(gState.player.x - fx, 2) + Math.pow(gState.player.z - fz, 2));
                        if (distToFloor < minDist) {
                            minDist = distToFloor;
                            bestX = fx;
                            bestZ = fz;
                        }
                    }
                }
            }
            // Rapidly nudge towards safety
            gState.player.x += (bestX - gState.player.x) * 0.2;
            gState.player.z += (bestZ - gState.player.z) * 0.2;
        }

        // --- Enemy AI & Damage to Player ---
        for (let i = 0; i < gState.nodes.length; i++) {
            const node = gState.nodes[i];
            if (!node.active) continue;

            const ndx = gState.player.x - node.x;
            const ndz = gState.player.z - node.z;
            const dist = Math.sqrt(ndx * ndx + ndz * ndz);

            let moveX = 0;
            let moveZ = 0;

            if (dist < 15) { // Agro range
                moveX = (ndx / dist) * node.moveSpeed * delta;
                moveZ = (ndz / dist) * node.moveSpeed * delta;
            } else {
                // Roaming logic
                const tdx = node.roamTarget.x - node.x;
                const tdz = node.roamTarget.z - node.z;
                const tDist = Math.sqrt(tdx * tdx + tdz * tdz);

                if (tDist < 0.2) {
                    // Pick new roam target
                    const randX = (Math.random() * (gameMap[0].length - 2) + 1) * TILE_SIZE;
                    const randZ = (Math.random() * (gameMap.length - 2) + 1) * TILE_SIZE;
                    gState.nodes[i].roamTarget = { x: randX, z: randZ };
                } else {
                    moveX = (tdx / tDist) * (node.moveSpeed * 0.4) * delta;
                    moveZ = (tdz / tDist) * (node.moveSpeed * 0.4) * delta;
                }
            }

            // Wall Collision for Enemies (AABB)
            const nodeSize = 1.2; // Enemy physical size
            const nextX = node.x + moveX;
            const nextZ = node.z + moveZ;

            let canMoveEnemyX = true;
            let canMoveEnemyZ = true;

            const enemyTileX = Math.floor(node.x / TILE_SIZE);
            const enemyTileZ = Math.floor(node.z / TILE_SIZE);

            for (let r = Math.max(0, enemyTileZ - 1); r <= Math.min(gameMap.length - 1, enemyTileZ + 1); r++) {
                for (let c = Math.max(0, enemyTileX - 1); c <= Math.min(gameMap[0].length - 1, enemyTileX + 1); c++) {
                    if (gameMap[r][c] === 1) {
                        const wallRect = { x: c * TILE_SIZE - (TILE_SIZE / 2), z: r * TILE_SIZE - (TILE_SIZE / 2), width: TILE_SIZE, depth: TILE_SIZE };

                        const testEnemyX = { x: nextX - (nodeSize / 2), z: node.z - (nodeSize / 2), width: nodeSize, depth: nodeSize };
                        if (checkCollision(testEnemyX, wallRect)) canMoveEnemyX = false;

                        const testEnemyZ = { x: node.x - (nodeSize / 2), z: nextZ - (nodeSize / 2), width: nodeSize, depth: nodeSize };
                        if (checkCollision(testEnemyZ, wallRect)) canMoveEnemyZ = false;
                    }
                }
            }

            if (canMoveEnemyX) gState.nodes[i].x = nextX;
            if (canMoveEnemyZ) gState.nodes[i].z = nextZ;

            // If hit wall while roaming or chasing, stuck prevention
            if (!canMoveEnemyX || !canMoveEnemyZ) {
                if (dist >= 15) { // If roaming, pick new target
                    const randX = (Math.random() * (gameMap[0].length - 2) + 1) * TILE_SIZE;
                    const randZ = (Math.random() * (gameMap.length - 2) + 1) * TILE_SIZE;
                    gState.nodes[i].roamTarget = { x: randX, z: randZ };
                }
            }

            // Enemy Stuck Recovery (Push-out)
            const eTileX = Math.floor(gState.nodes[i].x / TILE_SIZE);
            const eTileZ = Math.floor(gState.nodes[i].z / TILE_SIZE);
            if (gameMap[eTileZ] && gameMap[eTileZ][eTileX] === 1) {
                // Find nearest floor
                let bX = gState.nodes[i].x, bZ = gState.nodes[i].z, mD = Infinity;
                for (let r = Math.max(0, eTileZ - 1); r <= Math.min(gameMap.length - 1, eTileZ + 1); r++) {
                    for (let c = Math.max(0, eTileX - 1); c <= Math.min(gameMap[0].length - 1, eTileX + 1); c++) {
                        if (gameMap[r][c] === 0) {
                            const fx = c * TILE_SIZE, fz = r * TILE_SIZE;
                            const d = Math.sqrt(Math.pow(gState.nodes[i].x - fx, 2) + Math.pow(gState.nodes[i].z - fz, 2));
                            if (d < mD) { mD = d; bX = fx; bZ = fz; }
                        }
                    }
                }
                gState.nodes[i].x += (bX - gState.nodes[i].x) * 0.2;
                gState.nodes[i].z += (bZ - gState.nodes[i].z) * 0.2;
            }

            // Collide with Player
            const pRect = { x: gState.player.x - (pSize / 2), z: gState.player.z - (pSize / 2), width: pSize, depth: pSize };
            const nRect = { x: gState.nodes[i].x - (TILE_SIZE / 2), z: gState.nodes[i].z - (TILE_SIZE / 2), width: TILE_SIZE, depth: TILE_SIZE };

            if (checkCollision(pRect, nRect)) {
                if (state.clock.elapsedTime > gState.player.invulnUntil) {
                    onHitPlayer();
                    gState.player.invulnUntil = state.clock.elapsedTime + 1.5; // 1.5s IFrames

                    // Knockback (Collision-Aware)
                    const kbx = -(ndx / Math.max(0.1, dist)) * 2.5;
                    const kbz = -(ndz / Math.max(0.1, dist)) * 2.5;

                    // Simple check for knockback safety
                    const kbTestX = { x: gState.player.x + kbx - (pSize / 2), z: gState.player.z - (pSize / 2), width: pSize, depth: pSize };
                    const kbTestZ = { x: gState.player.x - (pSize / 2), z: gState.player.z + kbz - (pSize / 2), width: pSize, depth: pSize };

                    let canMoveKBX = true;
                    let canMoveKBZ = true;

                    for (let r = Math.max(0, tileZ - 2); r <= Math.min(gameMap.length - 1, tileZ + 2); r++) {
                        for (let c = Math.max(0, tileX - 2); c <= Math.min(gameMap[0].length - 1, tileX + 2); c++) {
                            if (gameMap[r][c] === 1) {
                                const wallRect = { x: c * TILE_SIZE - (TILE_SIZE / 2), z: r * TILE_SIZE - (TILE_SIZE / 2), width: TILE_SIZE, depth: TILE_SIZE };
                                if (checkCollision(kbTestX, wallRect)) canMoveKBX = false;
                                if (checkCollision(kbTestZ, wallRect)) canMoveKBZ = false;
                            }
                        }
                    }

                    if (canMoveKBX) gState.player.x += kbx;
                    if (canMoveKBZ) gState.player.z += kbz;
                }
            }
        }

        // --- Projectile Physics & Enemy Damage ---
        for (let i = gState.projectiles.length - 1; i >= 0; i--) {
            const p = gState.projectiles[i];
            if (!p.active) continue;

            p.x += p.dx * delta;
            p.z += p.dz * delta;
            p.life -= delta;

            if (p.life <= 0) {
                p.active = false;
                continue;
            }

            // Wall Collision
            const pTileX = Math.floor(p.x / TILE_SIZE);
            const pTileZ = Math.floor(p.z / TILE_SIZE);
            if (gameMap[pTileZ] && gameMap[pTileZ][pTileX] === 1) {
                p.active = false; // Hit wall
                continue;
            }

            // Enemy Collision
            const projRect = { x: p.x - 0.2, z: p.z - 0.2, width: 0.4, depth: 0.4 };
            for (let j = 0; j < gState.nodes.length; j++) {
                const node = gState.nodes[j];
                if (!node.active) continue;
                const nRect = { x: node.x - (TILE_SIZE / 2), z: node.z - (TILE_SIZE / 2), width: TILE_SIZE, depth: TILE_SIZE };

                if (checkCollision(projRect, nRect)) {
                    p.active = false;
                    gState.nodes[j].health -= 1;
                    gState.nodes[j].lastHit = state.clock.elapsedTime;
                    audioManager.playGlitch(); // Hit sound

                    if (gState.nodes[j].health <= 0) {
                        // Check if this is the last active node
                        const otherNodesRemaining = gState.nodes.filter((n, idx) => idx !== j && n.active && n.health > 0).length;
                        
                        if (otherNodesRemaining === 0) {
                            // Trigger puzzle instead of instant death only for the final enemy
                            onPuzzleTrigger(j);
                        } else {
                            // Instant kill for non-final enemies
                            gState.nodes[j].active = false;
                            gState.cameraShake = 0.4;
                            onEnemyDestroyed();

                            // Spawn Debris
                            for (let k = 0; k < 8; k++) {
                                gState.debris.push({
                                    id: Date.now() + k,
                                    x: node.x,
                                    y: 0.6,
                                    z: node.z,
                                    vx: (Math.random() - 0.5) * 10,
                                    vy: Math.random() * 5 + 2,
                                    vz: (Math.random() - 0.5) * 10,
                                    life: 1.0,
                                    color: '#ff003c'
                                });
                            }
                        }
                    }
                    break; // Projectile destroyed, stop checking nodes
                }
            }
        }

        // --- Debris Physics ---
        for (let i = gState.debris.length - 1; i >= 0; i--) {
            const d = gState.debris[i];
            d.x += d.vx * delta;
            d.y += d.vy * delta;
            d.z += d.vz * delta;
            d.vy -= 9.8 * delta; // Gravity
            d.life -= delta;

            if (d.y < 0) { d.y = 0; d.vy *= -0.5; } // Simple bounce
            if (d.life <= 0) {
                gState.debris.splice(i, 1);
            }
        }

        // Fragment Collisions
        for (let i = 0; i < gState.fragments.length; i++) {
            const frag = gState.fragments[i];
            if (frag.active) {
                const pRect = { x: gState.player.x - (pSize / 2), z: gState.player.z - (pSize / 2), width: pSize, depth: pSize };
                const fRect = { x: frag.x - 0.5, z: frag.z - 0.5, width: 1, depth: 1 };
                if (checkCollision(pRect, fRect)) {
                    gState.fragments[i].active = false;
                    gState.experience += 50;
                    audioManager.playSuccess();
                    onCollectLore();
                }
            }
        }

        // Heart Collisions
        for (let i = 0; i < gState.hearts.length; i++) {
            const heart = gState.hearts[i];
            if (heart.active) {
                const pRect = { x: gState.player.x - (pSize / 2), z: gState.player.z - (pSize / 2), width: pSize, depth: pSize };
                const hRect = { x: heart.x - 0.5, z: heart.z - 0.5, width: 1, depth: 1 };
                if (checkCollision(pRect, hRect)) {
                    gState.hearts[i].active = false;
                    // Restore health but cap at max (which is hero strength based)
                    const maxHealth = 3 + Math.floor((hero?.powerstats?.strength || 50) / 25);
                    if (gState.health < maxHealth) {
                        gState.health++;
                        onHealPlayer(gState.health);
                    }
                    audioManager.playSuccess();
                }
            }
        }

        // Update Lights
        if (spotLightRef.current) {
            spotLightRef.current.position.x = gState.player.x;
            spotLightRef.current.position.z = gState.player.z;
        }
        if (pointLightRef.current) {
            pointLightRef.current.position.x = gState.player.x;
            pointLightRef.current.position.z = gState.player.z;
        }
    });

    const [renderNodes, setRenderNodes] = useState([]);
    const [renderProjectiles, setRenderProjectiles] = useState([]);
    const [renderFragments, setRenderFragments] = useState([]);
    const [renderHearts, setRenderHearts] = useState([]);
    const [renderDebris, setRenderDebris] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (gameStateRef.current) {
                const g = gameStateRef.current;
                setRenderNodes(g.nodes ? [...g.nodes] : []);
                setRenderProjectiles(g.projectiles ? [...g.projectiles] : []);
                setRenderFragments(g.fragments ? [...g.fragments] : []);
                setRenderHearts(g.hearts ? [...g.hearts] : []);
                setRenderDebris(g.debris ? [...g.debris] : []);
                setHudData({
                    nodes: g.nodes ? [...g.nodes] : [],
                    fragments: g.fragments ? [...g.fragments] : [],
                    hearts: g.hearts ? [...g.hearts] : [],
                    player: { ...g.player },
                    health: g.health
                });
            }
        }, 50);
        return () => clearInterval(interval);
    }, [gameStateRef]);

    const spotLightRef = useRef();
    const pointLightRef = useRef();

    return (
        <>
            <color attach="background" args={['#000']} />
            <fog attach="fog" args={['#000', 5, 25]} />

            <ambientLight intensity={0.1} />
            <Sparkles count={80} scale={20} size={1.5} speed={0.3} color="#00f0ff" />

            {/* Dynamic Volumetric-ish Light */}
            <spotLight
                ref={spotLightRef}
                position={[TILE_SIZE, 10, TILE_SIZE]}
                angle={0.3}
                penumbra={1}
                intensity={10}
                color="#00f0ff"
                castShadow
            />

            <pointLight ref={pointLightRef} position={[TILE_SIZE, 2, TILE_SIZE]} intensity={2} color="#00f0ff" />

            {/* The Map */}
            {mapElements}

            {/* The Nodes (Enemies) */}
            {renderNodes.map(n => n.active ? (
                <group key={`node-${n.id}`} position={[n.x, 0.6, n.z]}>
                    <Sphere args={[0.6, 16, 16]}>
                        <meshStandardMaterial
                            color={performance.now() / 1000 - n.lastHit < 0.1 ? '#fff' : '#ff003c'}
                            emissive={performance.now() / 1000 - n.lastHit < 0.1 ? '#fff' : '#ff003c'}
                            emissiveIntensity={performance.now() / 1000 - n.lastHit < 0.1 ? 10 : 2}
                            transparent
                            opacity={0.8}
                        />
                    </Sphere>
                    {/* Health Bar (Simple scaling box above) */}
                    <Box args={[1.5 * (n.health / 3), 0.1, 0.1]} position={[0, 1.2, 0]} material={new THREE.MeshBasicMaterial({ color: '#ff003c' })} />
                </group>
            ) : null)}

            {/* Debris */}
            {renderDebris.map(d => (
                <Debris key={`debris-${d.id}`} position={[d.x, d.y, d.z]} color={d.color} />
            ))}

            {/* Projectiles */}
            {renderProjectiles.map(p => p.active ? (
                <Projectile key={`proj-${p.id}`} position={[p.x, 0.6, p.z]} />
            ) : null)}

            {/* Data Fragments */}
            {renderFragments.map(f => f.active ? (
                <Box key={`frag-${f.id}`} args={[0.4, 0.4, 0.4]} position={[f.x, 0.4, f.z]} material={fragmentMaterial} />
            ) : null)}

            {/* Health Hearts */}
            {renderHearts.map(h => h.active ? (
                <Heart3D key={`heart-${h.id}`} position={[h.x, 0.8, h.z]} />
            ) : null)}


            {/* The Player Hero */}
            <HumanoidPlayer ref={playerRef} />
        </>
    );
};


// --- Engine Container (UI + Canvas Parent) ---
const GameEngine = () => {
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const hero = useGameStore(state => state.selectedHero);

    const [gameState, setGameState] = useState('STORY_INTRO'); // STORY_INTRO, EXPLORATION, COMBAT, PUZZLE, GAME_OVER, LEVEL_CLEAR
    const [currentLore, setCurrentLore] = useState(null);
    const [screenShake, setScreenShake] = useState(false);
    const [activePuzzle, setActivePuzzle] = useState({ data: null, nodeId: null, input: '', loading: false, error: null });

    // UI Score View and HUD Data
    const [scoreInfo, setScoreInfo] = useState({ experience: 0, puzzles: 0, health: 3 + Math.floor((hero?.powerstats?.strength || 50) / 25), level: 1 });
    const [hudData, setHudData] = useState({ nodes: [], fragments: [], hearts: [], player: { x: 0, z: 0 }, health: 3 });

    // Mutable Source of truth tracked across framerate independent renders
    const gameStateRef = useRef(null);
    if (!gameStateRef.current) {
        const initialData = generateLevelData(1, hero);
        gameStateRef.current = {
            level: 1,
            moveSpeed: 8 + ((hero?.powerstats?.speed || 50) / 10),
            health: 3 + Math.floor((hero?.powerstats?.strength || 50) / 25),
            experience: 0,
            puzzlesSolved: 0,
            cameraShake: 0,
            player: {
                ...initialData.player,
                facing: { x: 0, z: -1 },
                lastShot: 0,
                invulnUntil: 0
            },
            projectiles: [],
            debris: [],
            nodes: initialData.nodes,
            fragments: initialData.fragments,
            hearts: initialData.hearts,
            map: initialData.map
        };
    }

    const handlePuzzleTrigger = async (nodeId) => {
        setGameState('PUZZLE');
        setActivePuzzle(prev => ({ ...prev, loading: true, nodeId, input: '', error: null }));
        try {
            const data = await fetchHeartPuzzle();
            setActivePuzzle(prev => ({ ...prev, loading: false, data }));
        } catch (error) {
            console.error("Failed to fetch puzzle:", error);
            // In case of API failure, auto-destroy to avoid soft-lock
            handlePuzzleSuccess(nodeId);
        }
    };

    const handlePuzzleSubmit = () => {
        if (!activePuzzle.data) return;
        const solution = activePuzzle.data.solution.toString();
        
        if (activePuzzle.input.trim() === solution) {
            handlePuzzleSuccess(activePuzzle.nodeId);
        } else {
            handlePuzzleFail(activePuzzle.nodeId);
        }
    };

    const handlePuzzleSuccess = (nodeId) => {
        audioManager.playSuccess();
        setGameState('EXPLORATION');
        setActivePuzzle({ data: null, nodeId: null, input: '', loading: false, error: null });
        
        if (gameStateRef.current && gameStateRef.current.nodes[nodeId]) {
            const node = gameStateRef.current.nodes[nodeId];
            node.active = false;
            gameStateRef.current.cameraShake = 0.4;
            
            // Spawn Debris
            for (let k = 0; k < 8; k++) {
                gameStateRef.current.debris.push({
                    id: Date.now() + k,
                    x: node.x,
                    y: 0.6,
                    z: node.z,
                    vx: (Math.random() - 0.5) * 10,
                    vy: Math.random() * 5 + 2,
                    vz: (Math.random() - 0.5) * 10,
                    life: 1.0,
                    color: '#ff003c'
                });
            }
        }
        handleEnemyDestroyed();
    };

    const handlePuzzleFail = (nodeId) => {
        audioManager.playGlitch();
        setActivePuzzle(prev => ({ ...prev, input: '', error: 'INVALID_DECRYPTION_KEY' }));
        
        // Take damage
        gameStateRef.current.health--;
        setScoreInfo(prev => ({ ...prev, health: gameStateRef.current.health }));
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 300);
        
        if (gameStateRef.current.health <= 0) {
            setGameState('GAME_OVER');
        } else {
            // Kick out of puzzle, restore enemy health slightly
            if (gameStateRef.current && gameStateRef.current.nodes[nodeId]) {
                gameStateRef.current.nodes[nodeId].health = 1;
            }
            setTimeout(() => {
                setGameState('EXPLORATION');
                setActivePuzzle({ data: null, nodeId: null, input: '', loading: false, error: null });
            }, 1000);
        }
    };

    const handleNextLevel = () => {
        const nextLvl = gameStateRef.current.level + 1;
        const nextData = generateLevelData(nextLvl, hero);

        gameStateRef.current.level = nextLvl;
        gameStateRef.current.nodes = nextData.nodes;
        gameStateRef.current.fragments = nextData.fragments;
        gameStateRef.current.hearts = nextData.hearts;
        gameStateRef.current.map = nextData.map;
        gameStateRef.current.player.x = nextData.player.x;
        gameStateRef.current.player.z = nextData.player.z;
        gameStateRef.current.projectiles = [];

        audioManager.startBGM(nextLvl);
        setGameState('EXPLORATION');
        setScoreInfo(prev => ({ ...prev, level: nextLvl }));
    };

    const handleEnemyDestroyed = () => {
        gameStateRef.current.puzzlesSolved++;
        gameStateRef.current.experience += 150;
        setScoreInfo(prev => ({
            ...prev,
            experience: gameStateRef.current.experience,
            puzzles: gameStateRef.current.puzzlesSolved
        }));

        const remaining = gameStateRef.current.nodes.filter(n => n.active).length;
        if (remaining === 0) {
            gameStateRef.current.experience += 500 * gameStateRef.current.level;
            setGameState('LEVEL_CLEAR');
            setTimeout(() => {
                handleNextLevel();
            }, 3000);
        }
    };

    const handleCollectLore = () => {
        const lore = LORE_FRAGMENTS[Math.floor(Math.random() * LORE_FRAGMENTS.length)];
        setCurrentLore(lore);
        setTimeout(() => {
            setCurrentLore(null);
        }, 5000);
    };

    const handleGameOver = async () => {
        setGameState('GAME_OVER');
        try {
            if (user && user.token) {
                await submitScore({
                    userId: user._id,
                    distance: Math.floor(gameStateRef.current.experience),
                    puzzlesSolved: gameStateRef.current.puzzlesSolved
                }, user.token);
            }
        } catch (err) {
            console.error("Error submitting score", err);
        }
    };

    // Update HUD periodically so Radar and Game Over screens match the Ref state
    useEffect(() => {
        if (gameState !== 'EXPLORATION' && gameState !== 'GAME_OVER') return;
        const interval = setInterval(() => {
            if (gameStateRef.current) {
                setHudData({
                    nodes: gameStateRef.current.nodes ? Array.from(gameStateRef.current.nodes) : [],
                    fragments: gameStateRef.current.fragments ? Array.from(gameStateRef.current.fragments) : [],
                    hearts: gameStateRef.current.hearts ? Array.from(gameStateRef.current.hearts) : [],
                    player: { ...gameStateRef.current.player },
                    health: gameStateRef.current.health
                });
            }
        }, 100); // 10fps for UI radar is fine
        return () => clearInterval(interval);
    }, [gameState]);

    const radarNodes = hudData.nodes;
    const radarFragments = hudData.fragments;
    const radarHearts = hudData.hearts;
    const radarPlayer = hudData.player;
    const playerHealth = hudData.health;

    return (
        <div style={{
            position: 'relative',
            width: '95vw',
            maxWidth: '1400px',
            height: '80vh',
            minHeight: '600px',
            margin: '1rem auto',
            boxShadow: screenShake ? '0 0 50px rgba(255,0,0,0.8)' : '0 0 30px rgba(0,240,255,0.1)',
            borderRadius: '8px', overflow: 'hidden', background: '#000',
            transform: screenShake ? 'translate(5px, 5px)' : 'none',
            transition: 'transform 0.05s, box-shadow 0.2s'
        }}>

            {/* The Visor HUD */}
            <TopHUD
                experience={scoreInfo.experience}
                puzzles={scoreInfo.puzzles}
                health={scoreInfo.health}
                level={gameStateRef.current.level}
                totalPuzzles={gameStateRef.current.nodes.length}
                onExit={() => navigate('/')}
            />

            <Radar playerPos={radarPlayer} nodes={radarNodes} fragments={radarFragments} hearts={radarHearts} />

            {/* The 3D Render Canvas */}
            <Canvas shadows style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} gl={{ antialias: false }}>
                <World3D
                    gameState={gameState}
                    gameStateRef={gameStateRef}
                    gameMap={gameStateRef.current.map}
                    hero={hero}
                    onCollectLore={handleCollectLore}
                    onHealPlayer={(newHealth) => {
                        setScoreInfo(prev => ({ ...prev, health: newHealth }));
                    }}
                    onHitPlayer={() => {
                        gameStateRef.current.health--;
                        setScoreInfo(prev => ({ ...prev, health: gameStateRef.current.health }));
                        setScreenShake(true);
                        setTimeout(() => setScreenShake(false), 300);
                        if (gameStateRef.current.health <= 0) handleGameOver();
                    }}
                    onEnemyDestroyed={handleEnemyDestroyed}
                    onPuzzleTrigger={handlePuzzleTrigger}
                />

                <EffectComposer>
                    <Bloom
                        intensity={1.5}
                        luminanceThreshold={0.4}
                        luminanceSmoothing={0.9}
                        mipmapBlur
                    />
                    <ChromaticAberration
                        blendFunction={BlendFunction.NORMAL}
                        offset={[0.002, 0.002]}
                    />
                    <Noise opacity={0.05} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
            </Canvas>

            {/* Level Clear Overlay */}
            {gameState === 'LEVEL_CLEAR' && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'radial-gradient(circle, rgba(0,240,255,0.2) 0%, rgba(5,5,8,0.98) 100%)',
                    animation: 'pulseGlow 2s infinite'
                }}>
                    <div className="glass-panel" style={{
                        padding: '3rem', border: '1px solid var(--primary)',
                        width: '90%', maxWidth: '700px', textAlign: 'center'
                    }}>
                        <div className="panel-corner corner-tl" />
                        <div className="panel-corner corner-br" />
                        <h2 className="glitch-text" style={{ color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '1rem' }}>SECTOR_DECRYPTED</h2>
                        <div style={{ color: '#fff', fontSize: '1rem', letterSpacing: '2px', marginBottom: '2rem' }}>
                            UPLOADING FRAGMENT DATA...
                        </div>
                        <div style={{ color: 'var(--primary)', fontSize: '2rem', fontWeight: '900' }}>
                            +{500 * gameStateRef.current.level} <span style={{ fontSize: '1rem' }}>EXP_BONUS</span>
                        </div>
                        <div style={{ marginTop: '2rem', height: '4px', background: 'rgba(0,240,255,0.1)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--primary)', width: '100%', animation: 'progress 3s linear' }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Combat Overlay */}
            {gameState === 'COMBAT' && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'radial-gradient(circle, rgba(255,0,60,0.2) 0%, rgba(5,5,8,0.95) 100%)',
                    animation: 'pulseDanger 2s infinite'
                }}>
                    <div className="glass-panel" style={{
                        padding: '4rem', border: '1px solid var(--secondary)',
                        boxShadow: '0 0 50px rgba(255,0,60,0.2), inset 0 0 30px rgba(255,0,60,0.05)',
                        width: '90%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}>
                        <div className="panel-corner corner-tl" style={{ borderColor: 'var(--secondary)' }} />
                        <div className="panel-corner corner-br" style={{ borderColor: 'var(--secondary)' }} />

                        <div style={{ color: 'var(--secondary)', fontSize: '0.7rem', letterSpacing: '8px', marginBottom: '1rem', fontWeight: 'bold' }}>DETECTION_ALERT</div>

                        <h2 className="glitch-text" style={{ color: 'var(--secondary)', textShadow: 'none', marginBottom: '1.5rem', fontSize: '2.5rem', textAlign: 'center' }}>
                            FIREWALL_INTERCEPT
                        </h2>

                        <div style={{ width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, var(--secondary), transparent)', marginBottom: '2rem' }} />

                        <div style={{ fontFamily: 'Fira Code', color: 'var(--text-main)', fontSize: '0.9rem', textAlign: 'center', opacity: 0.8 }}>
                            UNAUTHORIZED_ACCESS_LOCK: SECTOR_7<br />
                            ENCRYPTION_STRENGTH: ULTRA_LOCKED<br />
                            <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>STATUS: ENGAGING_TARGET...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Puzzle Overlay */}
            {gameState === 'PUZZLE' && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 25, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'radial-gradient(circle, rgba(0,240,255,0.1) 0%, rgba(5,5,8,0.98) 100%)',
                    backdropFilter: 'blur(5px)'
                }}>
                    <div className="glass-panel" style={{
                        padding: '3rem', border: `1px solid ${activePuzzle.error ? 'var(--secondary)' : 'var(--primary)'}`,
                        width: '90%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                        boxShadow: activePuzzle.error ? '0 0 30px rgba(255,0,60,0.3)' : '0 0 30px rgba(0,240,255,0.1)'
                    }}>
                        <div className="panel-corner corner-tl" style={{ borderColor: activePuzzle.error ? 'var(--secondary)' : 'var(--primary)' }} />
                        <div className="panel-corner corner-br" style={{ borderColor: activePuzzle.error ? 'var(--secondary)' : 'var(--primary)' }} />

                        <div style={{ color: activePuzzle.error ? 'var(--secondary)' : 'var(--primary)', fontSize: '0.8rem', letterSpacing: '4px', marginBottom: '1rem' }}>
                            {activePuzzle.error ? 'DECRYPTION_FAILED' : 'FIREWALL_OVERRIDE_REQUIRED'}
                        </div>

                        {activePuzzle.loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4rem 0' }}>
                                <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(0,240,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                <div style={{ color: 'var(--text-main)', marginTop: '1rem', fontFamily: 'Fira Code' }}>FETCHING_ENCRYPTION_MATRIX...</div>
                            </div>
                        ) : (
                            <>
                                {activePuzzle.data && (
                                    <div style={{ background: '#fff', padding: '10px', borderRadius: '4px', marginBottom: '2rem' }}>
                                        <img src={activePuzzle.data.question} alt="Decryption Matrix" style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
                                    </div>
                                )}
                                
                                {activePuzzle.error && (
                                    <div style={{ color: 'var(--secondary)', fontFamily: 'Fira Code', marginBottom: '1rem', animation: 'blink 0.5s infinite' }}>
                                        WARNING: {activePuzzle.error}
                                    </div>
                                )}

                                <div style={{ width: '100%', display: 'flex', gap: '1rem' }}>
                                    <input 
                                        type="number"
                                        className="form-input"
                                        placeholder="ENTER_SOLUTION_KEY"
                                        value={activePuzzle.input}
                                        onChange={(e) => setActivePuzzle(prev => ({ ...prev, input: e.target.value }))}
                                        onKeyDown={(e) => e.key === 'Enter' && handlePuzzleSubmit()}
                                        style={{ flex: 1, textAlign: 'center', fontSize: '1.2rem', letterSpacing: '2px' }}
                                        autoFocus
                                    />
                                    <button 
                                        className="btn-primary" 
                                        onClick={handlePuzzleSubmit}
                                        style={{ padding: '0 2rem' }}
                                    >
                                        EXECUTE
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Story Intro / Transmission Overlay */}
            {gameState === 'STORY_INTRO' && (
                <TransmissionTerminal onComplete={() => setGameState('EXPLORATION')} />
            )}

            {/* Lore Overlay */}
            <div style={{
                position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                zIndex: 15, background: 'rgba(0,0,0,0.8)', padding: '1rem 2rem',
                border: '1px solid var(--terminal-green)', color: 'var(--terminal-green)',
                fontFamily: 'Fira Code', borderRadius: '4px',
                opacity: currentLore ? 1 : 0, transition: 'opacity 0.5s',
                pointerEvents: 'none', boxShadow: '0 0 10px rgba(57, 255, 20, 0.2)'
            }}>
                {currentLore}
            </div>

            {/* Game Over Screen */}
            {gameState === 'GAME_OVER' && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 30, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', background: 'rgba(5,5,8,0.95)',
                    backdropFilter: 'blur(20px)'
                }}>
                    <div className="glass-panel" style={{ padding: '4rem', width: '90%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: playerHealth <= 0 ? '1px solid var(--secondary)' : '1px solid var(--terminal-green)' }}>
                        <div className="panel-corner corner-tl" />
                        <div className="panel-corner corner-br" />

                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '4px', marginBottom: '1rem' }}>SIMULATION_TERMINATED</div>

                        <h1 className="glitch-text" style={{
                            color: playerHealth <= 0 ? 'var(--secondary)' : 'var(--terminal-green)',
                            fontSize: '3.5rem', marginBottom: '1rem', textShadow: 'none'
                        }}>
                            {playerHealth <= 0 ? 'SYSTEM_FAILURE' : 'GRID_PURIFIED'}
                        </h1>

                        <p style={{ color: 'var(--text-main)', fontFamily: 'Fira Code', fontSize: '1rem', maxWidth: '600px', textAlign: 'center', marginTop: '1rem', lineHeight: '1.6', opacity: 0.8 }}>
                            {playerHealth <= 0
                                ? "CRITICAL_ERROR: Neural-link severed. The rogue entities have compromised your instance. Data recovery failed."
                                : "SUCCESS: All rogue nodes neutralized. Source code fragments recovered. Grid stability has been restored to 99.9%."}
                        </p>

                        <div style={{ display: 'flex', gap: '3rem', margin: '3rem 0', width: '100%', justifyContent: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', color: 'var(--primary)', fontWeight: '900' }}>{Math.floor(scoreInfo.experience)}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '2px' }}>EXP_GAINED</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', color: '#ffd700', fontWeight: '900' }}>{scoreInfo.puzzles}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '2px' }}>NODES_HACKED</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', width: '100%', justifyContent: 'center' }}>
                            <button className="btn-primary" onClick={() => window.location.reload()} style={{ flex: 1, maxWidth: '250px' }}>REBOOT_INSTANCE</button>
                            <button className="btn-secondary" onClick={() => navigate('/')} style={{ flex: 1, maxWidth: '250px' }}>RETURN_TO_HUB</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameEngine;
