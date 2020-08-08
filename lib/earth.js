import {
  BackSide,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  SphereGeometry,
  TextureLoader,
} from 'three';
import { createGlowMesh } from 'three-glow-mesh';

import {
  defaultGlobeBackgroundTexture,
  defaultGlobeCloudsTexture,
  defaultGlobeTexture,
} from './defaults';
import { RADIUS } from './enums';

const BACKGROUND_RADIUS_SCALE = 10;
const CLOUDS_RADIUS_OFFSET = 1;
const GLOBE_SEGMENTS = 50;

export function createEarth() {
  const clouds = new Mesh();
  const globe = new Mesh();
  const background = new Mesh();

  return {
    clouds,
    globe,
    background,
  };
}

export function updateEarth(earth, { callbacks, options, textures }) {
  const {
    enableGlobeGlow,
    globeCloudsOpacity,
    globeGlowColor,
    globeGlowCoefficient,
    globeGlowPower,
    globeGlowRadiusScale,
  } = options;
  const {
    onGlobeBackgroundTextureLoaded,
    onGlobeCloudsTextureLoaded,
    onGlobeTextureLoaded,
  } = callbacks;
  const {
    globeBackgroundTexture = defaultGlobeBackgroundTexture,
    globeCloudsTexture = defaultGlobeCloudsTexture,
    globeTexture = defaultGlobeTexture,
  } = textures;
  let { clouds, globe, glow, background } = earth;

  globe.children = [];

  if (globeTexture) {
    new TextureLoader().load(
      globeTexture,
      map => {
        globe.geometry = new SphereGeometry(
          RADIUS,
          GLOBE_SEGMENTS,
          GLOBE_SEGMENTS,
        );
        globe.material = new MeshLambertMaterial({ map });
        if (enableGlobeGlow) {
          glow = createGlowMesh(globe.geometry, {
            backside: true,
            coefficient: globeGlowCoefficient,
            color: globeGlowColor,
            power: globeGlowPower,
            size: RADIUS * globeGlowRadiusScale,
          });
          globe.add(glow);
        }
        onGlobeTextureLoaded();
      },
      () => {},
      onGlobeTextureLoaded,
    );
  }

  if (globeBackgroundTexture) {
    new TextureLoader().load(
      globeBackgroundTexture,
      map => {
        background.geometry = new SphereGeometry(
          RADIUS * BACKGROUND_RADIUS_SCALE,
          GLOBE_SEGMENTS,
          GLOBE_SEGMENTS,
        );
        background.material = new MeshBasicMaterial({ map, side: BackSide });
        onGlobeBackgroundTextureLoaded();
      },
      () => {},
      onGlobeBackgroundTextureLoaded,
    );
    globe.add(background);
  }

  if (globeCloudsTexture) {
    new TextureLoader().load(
      globeCloudsTexture,
      map => {
        clouds.geometry = new SphereGeometry(
          RADIUS + CLOUDS_RADIUS_OFFSET,
          GLOBE_SEGMENTS,
          GLOBE_SEGMENTS,
        );
        clouds.material = new MeshLambertMaterial({ map, transparent: true });
        clouds.material.opacity = globeCloudsOpacity;
        onGlobeCloudsTextureLoaded();
      },
      () => {},
      onGlobeCloudsTextureLoaded,
    );
    globe.add(clouds);
  }
}