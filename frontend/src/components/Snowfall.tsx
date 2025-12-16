import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import styled from "styled-components";

const ParticlesWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  pointer-events: none;
  z-index: 0;

  #snowfall {
    width: 100%;
    height: 100%;
  }
`;

export function Snowfall() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  if (!init) return null;

  const OPTIONS = {
    fullScreen: false,
    fpsLimit: 60,
    background: {
      color: "transparent",
    },
    particles: {
      number: {
        value: 200,
        density: {
          enable: true,
        },
      },
      color: {
        value: "#ffffff",
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: { min: 0.3, max: 0.8 },
      },
      size: {
        value: { min: 1, max: 4 },
      },
      move: {
        enable: true,
        speed: { min: 0.2, max: 0.8 },
        direction: "bottom" as const,
        straight: false,
        decay: 0,
        outModes: {
          default: "out" as const,
        },
      },
      wobble: {
        enable: true,
        distance: 5,
        speed: {
          min: -2,
          max: 2,
        },
      },
    },
    detectRetina: true,
  }

  return (
    <ParticlesWrapper>
      <Particles
        id="snowfall"
        style={{ width: "100%", height: "100%" }}
        options={OPTIONS}
      />
    </ParticlesWrapper>
  );
}
