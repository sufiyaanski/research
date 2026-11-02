import React from "react";
import { Composition } from "remotion";
import { Scene, sceneSchema } from "./Scene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QrosityScene"
        component={Scene}
        schema={sceneSchema}
        defaultProps={{
          title: "WHAT IF",
          subtitle: "you fell into a volcano?",
          pose: "auto",
        }}
        width={1080}
        height={1920}
        fps={60}
        durationInFrames={6 * 60}
      />
    </>
  );
};
