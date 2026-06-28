import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { MdPlayCircleFilled, MdCalendarToday } from "react-icons/md";
import { RiUserLine } from "react-icons/ri";
import { motion } from "framer-motion";
import { Col, Row } from "reactstrap";
import { isDesktop } from "react-device-detect";
import { useHistory } from "react-router-dom/cjs/react-router-dom";

import "../pages/replay/ReplayList.css";
import { IoPlayForwardCircleOutline } from "react-icons/io5";
import { REPLAY_API_URL } from "utils/api/api";

const ReplayLive = ({ isSearch }) => {
  const [videos, setVideos] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);
  const navigate = useHistory();

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await axios.get(REPLAY_API_URL);
        setVideos(response.data.slice(0, 10));
      } catch (error) {
        console.log(error);
      }
    }
    fetchVideos();
  }, []);

  const handleScroll = (scrollOffset) => {
    if (containerRef.current) {
      const newScrollPosition = scrollPosition + scrollOffset;
      const maxScrollLeft =
        containerRef.current.scrollWidth - containerRef.current.clientWidth;
      if (newScrollPosition >= 0 && newScrollPosition <= maxScrollLeft) {
        containerRef.current.scrollLeft = newScrollPosition;
        setScrollPosition(newScrollPosition);
      }
    }
  };

  const getYouTubeThumbnail = (youtubeId) => {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  };

  const handleVideoClick = (video) => {
    navigate.push(`/replay/${video.member.toLowerCase()}/${video.youtube_id}`, { video });
  };

  return (
    videos.length > 0 &&
    !isSearch && (
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between py-1">
          <h3>Replay Live</h3>
          <Link to="/replay">
            <div
              className="d-flex align-items-center"
              style={{ color: "#ECFAFC" }}
            >
              <IoPlayForwardCircleOutline className="mb-2 mr-2" size={25} />
              <h5>See More</h5>
            </div>
          </Link>
        </div>

        <div className="scroll-menu-container">
          {isDesktop && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => handleScroll(-300)}
              className={`arrow-button left ${
                scrollPosition === 0 ? "d-none" : ""
              }`}
            >
              <BiChevronLeft
                size={70}
                color="white"
                className={`arrow-button left ${
                  scrollPosition === 0 ? "d-none" : ""
                }`}
              />
            </motion.div>
          )}
          <div className="recent-live-container" ref={containerRef}>
            <Row className="flex-nowrap mt-2">
              {videos.map((video, idx) => (
                <Col
                  key={idx}
                  md="4"
                  sm="12"
                  className={`${idx !== videos.length - 1 && "mb-3"}`}
                >
                  <div
                    className="replay-card"
                    onClick={() => handleVideoClick(video)}
                    style={{ height: "100%" }}
                  >
                    <div className="replay-card-thumbnail-wrapper">
                      <img
                        src={getYouTubeThumbnail(video.youtube_id)}
                        alt={video.title}
                        className="replay-card-thumbnail"
                        loading="lazy"
                      />
                      <div className="replay-card-play-overlay">
                        <MdPlayCircleFilled className="replay-play-icon" />
                      </div>
                      <div className="replay-card-platform-badge">
                        {video.platform}
                      </div>
                    </div>

                    <div className="replay-card-body">
                      <h5 className="replay-card-title">{video.title}</h5>
                      <div className="replay-card-meta">
                        <span className="replay-card-member">
                          <RiUserLine className="replay-meta-icon" />
                          {video.member}
                        </span>
                        <span className="replay-card-date">
                          <MdCalendarToday className="replay-meta-icon" />
                          {video.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            className={`arrow-button right ${
              scrollPosition >=
              containerRef.current?.scrollWidth -
                containerRef.current?.clientWidth
                ? "d-none"
                : ""
            }`}
            onClick={() => handleScroll(300)}
          >
            <BiChevronRight
              size={70}
              color="white"
              className={`arrow-button right ${
                scrollPosition >=
                containerRef.current?.scrollWidth -
                  containerRef.current?.clientWidth
                  ? "d-none"
                  : ""
              }`}
            />
          </motion.div>
        </div>
        <hr style={{ borderColor: "white" }} />
      </div>
    )
  );
};

export default ReplayLive;
