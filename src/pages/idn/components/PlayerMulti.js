import React from "react";
import ReactPlayer from "react-player";
import "../../streaming/video.scss";

export default function PlayerMulti({ url, number, idnUrl, refreshKey }) {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  return (
    <div className="idn-live player-wrapper mb-3">
      <ReactPlayer
        key={refreshKey}
        className="react-player"
        config={{
          file: {
            forceHLS: !isSafari,
          },
        }}
        controls
        url={url}
        width="100%"
        height="auto"
        playing={true}
        muted={number != 1}
      />
    </div>
  );
}
