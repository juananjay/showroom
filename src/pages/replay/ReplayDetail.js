import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { Col, Row } from "reactstrap";
import MainLayout from "../layout/MainLayout";
import ReplayChat from "./ReplayChat";
import "./ReplayDetail.css";

const ReplayDetail = (props) => {
  const { id } = useParams();
  const location = useLocation();
  const video = location.state?.video;
  const playerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  const title = video?.title || "Replay Live Streaming JKT48";
  const member = video?.member || "";
  const date = video?.date || "";
  const platform = video?.platform || "";
  const srtFile = video?.srt_file || `${id}.srt`;

  // Load YouTube IFrame API
  useEffect(() => {
    window.scrollTo(0, 0);

    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(tag, firstScript);

    window.onYouTubeIframeAPIReady = () => {
      createPlayer();
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  const createPlayer = () => {
    if (playerRef.current && window.YT) {
      new window.YT.Player(playerRef.current, {
        videoId: id,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            setPlayer(event.target);
          },
          onStateChange: (event) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    }
  };

  // Poll current time from YouTube player
  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      try {
        const time = player.getCurrentTime();
        if (typeof time === "number") {
          setCurrentTime(time);
        }
      } catch (e) {
        console.log(e)
      }
    }, 500);

    return () => clearInterval(interval);
  }, [player]);

  return (
    <MainLayout
      {...props}
      title={title}
      description={`Replay ${title}`}
    >
      <div className="layout">
        <Row>
          <Col md={"8"}>
            <div className="replay-player-wrapper">
              <div className="replay-player-container">
                <div ref={playerRef} id="replay-yt-player" />
              </div>
            </div>

            <div className="replay-video-info">
              <h4 className="replay-video-title">{title}</h4>
              <div className="replay-video-meta-row">
                <div className="replay-video-meta-left">
                  <span className="replay-video-member">{member}</span>
                  <span className="replay-video-separator">•</span>
                  <span className="replay-video-date">{date}</span>
                  <span className="replay-video-separator">•</span>
                  <span className="replay-video-platform-badge">{platform}</span>
                </div>
              </div>
            </div>
          </Col>

          <Col md={"4"}>
            <ReplayChat
              srtFile={srtFile}
              currentTime={currentTime}
              isPlaying={isPlaying}
              isTheaterMode={isTheaterMode}
            />
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default ReplayDetail;
